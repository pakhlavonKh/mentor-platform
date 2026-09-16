/**
 * Helper to generate pre-filled Telegram payment URL
 */

export function formatTelegramPaymentMessage({
  orderId,
  planName,
  price,
  documents,
  user,
}: {
  orderId: string;
  planName: string;
  price: number;
  documents: number;
  user: { firstName?: string; lastName?: string; email?: string };
}) {
  const shortId = orderId ? orderId.slice(0, 8) : "NEW";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student";
  const email = user.email || "";

  return (
    `Здравствуйте! Я хочу оплатить тариф «${planName}» ($${price}).\n` +
    `• Номер заказа: #${shortId}\n` +
    `• Документов на проверку: ${documents}\n` +
    `• Имя: ${fullName}\n` +
    `• Email: ${email}\n\n` +
    `Пожалуйста, отправьте реквизиты для оплаты (Kaspi / перевод).`
  );
}

export function getTelegramPaymentUrl(params: {
  orderId: string;
  planName: string;
  price: number;
  documents: number;
  user: { firstName?: string; lastName?: string; email?: string };
}) {
  const message = formatTelegramPaymentMessage(params);
  return `https://t.me/studyqadam_corporate?text=${encodeURIComponent(message)}`;
}
