// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// nodemailer は Node.js API に依存するため、Edge Runtime では動作しない。
// 明示しておかないとデプロイ環境によってはビルド／実行時に失敗する。
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// SMTP 接続はデフォルトの実行時間上限（10秒）を超えることがある
export const maxDuration = 30;

const MAX_LENGTH = {
  name: 100,
  email: 254,
  phone: 30,
  message: 2000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 文字列以外が送られてきても落ちないようにする（body.name?.trim() は数値等で例外になる） */
const toText = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/** ヘッダーインジェクション対策：改行を含む値を Subject / Reply-To に入れない */
const sanitizeHeader = (value: string): string =>
  value.replace(/[\r\n]+/g, ' ').trim();

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'リクエストの形式が正しくありません。' },
        { status: 400 }
      );
    }

    const data = (body ?? {}) as Record<string, unknown>;

    const name = toText(data.name, MAX_LENGTH.name);
    const email = toText(data.email, MAX_LENGTH.email);
    const phone = toText(data.phone, MAX_LENGTH.phone);
    const message = toText(data.message, MAX_LENGTH.message);

    // サーバーサイドでの必須バリデーション
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: '必須項目が入力されていません。' },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: 'メールアドレスの形式が正しくありません。' },
        { status: 400 }
      );
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;
    const toAddress = process.env.CONTACT_TO_EMAIL || 'hailrose.work@gmail.com';

    if (!gmailUser || !gmailPass) {
      console.error('Mail config error: GMAIL_USER / GMAIL_PASS is not set');
      return NextResponse.json(
        { error: 'メール送信の設定に問題があります。管理者にご連絡ください。' },
        { status: 500 }
      );
    }

    // service: 'gmail' に任せず、ポートとタイムアウトを明示する。
    // 未指定だと接続が滞留したままレスポンスが返らないことがある。
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });

    const mailOptions = {
      from: `"WEBサイトお問い合わせ" <${gmailUser}>`,
      to: toAddress,
      replyTo: sanitizeHeader(email),
      subject: sanitizeHeader(`【WEBサイトお問い合わせ】${name}様より`),
      text: [
        'WEBサイトからお問い合わせがありました。',
        '',
        '■ お名前',
        name,
        '',
        '■ メールアドレス',
        email,
        '',
        '■ 電話番号',
        phone || '（未入力）',
        '',
        '■ お問い合わせ内容',
        message,
      ].join('\n'),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: '送信が完了しました。' });
  } catch (error) {
    console.error('Mail Send Error:', error);
    return NextResponse.json(
      { error: 'メール送信に失敗しました。時間をおいて再度お試しください。' },
      { status: 500 }
    );
  }
}
