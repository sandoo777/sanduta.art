import { useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface UploadDesignButtonProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export function UploadDesignButton({ onUpload, disabled }: UploadDesignButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.ai,.eps,.svg,.cdr,.zip,.rar,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled}
        className="w-full"
      >
        Încarcă macheta proprie
      </Button>
    </>
  );
}
