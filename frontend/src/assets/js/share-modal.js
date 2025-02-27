// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Safely query for share button elements
  const shareButtons = document.querySelectorAll('.share-button');
  
  // Only add event listeners if elements exist
  if (shareButtons && shareButtons.length > 0) {
    shareButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get share data from data attributes if available
        const url = this.dataset.url || window.location.href;
        const title = this.dataset.title || document.title;
        
        // Check if Web Share API is available
        if (navigator.share) {
          navigator.share({
            title: title,
            url: url
          })
          .catch(err => {
            console.log('Error sharing:', err);
          });
        } else {
          // Fallback for browsers that don't support the Web Share API
          // You could implement a custom modal here
          console.log('Web Share API not supported');
          
          // Optional: copy to clipboard as fallback
          navigator.clipboard.writeText(url)
            .then(() => {
              // Show feedback that URL was copied
              alert('Link copied to clipboard!');
            })
            .catch(err => {
              console.error('Failed to copy: ', err);
            });
        }
      });
    });
  }
});