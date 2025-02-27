import React from 'react';
import { toast } from 'react-hot-toast';

interface ShareButtonProps {
  url?: string;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url = window.location.href,
  title = document.title,
  className = "text-blue-600 hover:text-blue-800",
  children
}) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      toast.error('Failed to share');
    }
  };

  return (
    <button 
      onClick={handleShare}
      className={className}
    >
      {children || 'Share'}
    </button>
  );
};

export default ShareButton;