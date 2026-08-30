'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface WhatsAppShareButtonProps {
  title?: string;
  shareText: string;
  url?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export const WhatsAppShareButton: React.FC<WhatsAppShareButtonProps> = ({
  shareText,
  url,
  buttonText = 'Share on WhatsApp',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const fullMessage = url ? `${shareText}\n\n🔗 Calculated via ConvertHub: ${url}` : shareText;

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleWhatsAppShare}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        <svg
          className="h-4 w-4 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.777.818 2.79.818 3.179 0 5.767-2.587 5.768-5.766.001-3.18-2.585-5.804-5.767-5.804zm8.397 5.828c-.015 4.629-3.774 8.388-8.404 8.388-1.464 0-2.884-.39-4.14-1.127l-4.593 1.205 1.229-4.484c-.8-1.319-1.229-2.839-1.229-4.398.015-4.63 3.774-8.389 8.404-8.389 4.631.001 8.403 3.775 8.403 8.405zm-3.693 2.822c-.201-.1-.994-.491-1.148-.547-.154-.057-.266-.086-.379.085-.113.171-.436.547-.535.661-.099.114-.198.128-.399.028-.201-.1-.85-.313-1.618-.999-.598-.533-1.002-1.192-1.12-1.393-.118-.201-.013-.31.088-.41.091-.09.201-.235.302-.352.101-.118.134-.199.201-.332.067-.134.034-.251-.017-.352s-.379-.912-.519-1.25c-.137-.329-.276-.284-.379-.289-.098-.005-.211-.006-.324-.006s-.297.042-.452.212c-.156.17-.597.583-.597 1.422s.61 1.652.695 1.766c.085.114 1.201 1.834 2.91 2.571.407.175.725.28 0.973.359.409.13.782.112 1.077.068.329-.049 1.01-.413 1.153-.812.143-.399.143-.741.1-.812-.043-.072-.156-.114-.357-.214z" />
        </svg>
        <span>{buttonText}</span>
      </button>

      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={handleCopyText}
        leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      >
        {copied ? 'Copied to Clipboard' : 'Copy Text'}
      </Button>
    </div>
  );
};
