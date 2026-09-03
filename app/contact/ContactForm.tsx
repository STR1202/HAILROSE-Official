// app/contact/ContactForm.tsx
'use client';

import { useRef, useState } from 'react';

type FieldName = 'name' | 'email' | 'phone' | 'message';

const MAX_LENGTH: Record<FieldName, number> = {
  name: 100,
  email: 254,
  phone: 30,
  message: 2000,
};

// 送信のタイムアウト（モバイル回線で無応答のまま固まるのを防ぐ）
const REQUEST_TIMEOUT_MS = 30000;

// iOSの自動ズーム（font-size < 16px で発生）を避けるため text-base を必ず付ける。
// appearance-none は iOS Safari のデフォルト内影・角丸を消すため。
const FIELD_BASE =
  'w-full px-4 py-3 bg-black/90 text-white text-base appearance-none rounded-xl ' +
  'focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const statusRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const fieldRefs = { name: nameRef, email: emailRef, message: messageRef };

  const validate = () => {
    const newErrors: Partial<Record<FieldName, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'お名前を入力してください。';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください。';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = '有効なメールアドレス形式で入力してください。';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'お問い合わせ内容を入力してください。';
    }

    setErrors(newErrors);

    // 最初のエラー項目にフォーカスを移す（スマホでは画面外のエラーに気付けないため）
    const firstError = (['name', 'email', 'message'] as const).find(
      (key) => newErrors[key]
    );
    if (firstError) {
      const el = fieldRefs[firstError].current;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as FieldName]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const showStatus = (type: 'success' | 'error', message: string) => {
    setSubmitStatus({ type, message });
    // 送信ボタンは画面下部にあるため、上部の結果表示までスクロールしないと見えない
    requestAnimationFrame(() => {
      statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      statusRef.current?.focus({ preventScroll: true });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // iOSのダブルタップによる二重送信を防ぐ
    if (isSubmitting) return;

    setSubmitStatus({ type: null, message: '' });
    if (!validate()) return;

    setIsSubmitting(true);

    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
    };

    // AbortSignal.timeout() は iOS 16 未満で未対応のため AbortController を使う
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        cache: 'no-store',
        signal: controller.signal,
      });

      // タイムアウトやプロキシのエラーページではHTMLが返るため、
      // 無条件の res.json() は SyntaxError になる。content-type を確認してから読む。
      const contentType = res.headers.get('content-type') ?? '';
      let data: { error?: string; message?: string } = {};
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = {};
        }
      }

      if (!res.ok) {
        throw new Error(data.error || `送信に失敗しました。(${res.status})`);
      }

      showStatus(
        'success',
        'お問い合わせを送信しました。返信まで今しばらくお待ちください。'
      );
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: unknown) {
      let errorMessage = '送信中にエラーが発生しました。';

      if (err instanceof DOMException && err.name === 'AbortError') {
        errorMessage =
          '通信がタイムアウトしました。電波状況をご確認のうえ、再度お試しください。';
      } else if (err instanceof TypeError) {
        errorMessage =
          'ネットワークに接続できませんでした。通信環境をご確認ください。';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      showStatus('error', errorMessage);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative z-9999">
      {submitStatus.message && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className={`w-full p-4 mb-8 text-sm font-semibold border rounded-xl scroll-mt-32 focus:outline-none ${
            submitStatus.type === 'success'
              ? 'bg-green-950/90 border-green-500 text-green-200'
              : 'bg-red-950/90 border-red-500 text-red-200'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-6 bg-black/80 p-6 md:p-10 rounded-2xl border border-white/20 shadow-2xl relative"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="text-sm font-bold tracking-wider text-white"
          >
            お名前 <span className="text-red-500 text-xs">(必須)</span>
          </label>
          <input
            ref={nameRef}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={MAX_LENGTH.name}
            autoComplete="name"
            enterKeyHint="next"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`${FIELD_BASE} scroll-mt-32 border ${
              errors.name ? 'border-red-500' : 'border-white/30'
            }`}
          />
          {errors.name && (
            <p id="name-error" className="text-red-400 text-xs mt-0.5">
              {errors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-bold tracking-wider text-white"
          >
            メールアドレス <span className="text-red-500 text-xs">(必須)</span>
          </label>
          <input
            ref={emailRef}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            maxLength={MAX_LENGTH.email}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`${FIELD_BASE} scroll-mt-32 border ${
              errors.email ? 'border-red-500' : 'border-white/30'
            }`}
          />
          {errors.email && (
            <p id="email-error" className="text-red-400 text-xs mt-0.5">
              {errors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="phone"
            className="text-sm font-bold tracking-wider text-white"
          >
            電話番号 <span className="text-gray-400 text-xs">(任意)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength={MAX_LENGTH.phone}
            autoComplete="tel"
            inputMode="tel"
            enterKeyHint="next"
            className={`${FIELD_BASE} border border-white/30`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="message"
            className="text-sm font-bold tracking-wider text-white"
          >
            お問い合わせ内容 <span className="text-red-500 text-xs">(必須)</span>
          </label>
          <textarea
            ref={messageRef}
            id="message"
            name="message"
            rows={8}
            value={formData.message}
            onChange={handleChange}
            maxLength={MAX_LENGTH.message}
            enterKeyHint="enter"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
            className={`${FIELD_BASE} scroll-mt-32 resize-y border ${
              errors.message ? 'border-red-500' : 'border-white/30'
            }`}
          />
          {errors.message && (
            <p id="message-error" className="text-red-400 text-xs mt-0.5">
              {errors.message}
            </p>
          )}
        </div>

        <div className="w-full flex justify-end mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 min-h-11 bg-red-600 hover:bg-red-500 active:bg-red-700 font-bold text-sm tracking-widest uppercase transition-all rounded-full text-white cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation select-none"
          >
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </div>
      </form>
    </div>
  );
}
