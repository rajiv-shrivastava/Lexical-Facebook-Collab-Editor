// // generatePdfFromDom.js
// import $ from 'jquery';

// /**
//  * Uses jQuery to select DOM content and sends it to the backend to create a PDF
//  * @param {string} selector - jQuery-style selector (e.g. '.editor-autosave-wp-1--')
//  */
// export async function generatePdfFromDom(selector) {
//   const htmlContent = $(selector).html();

//   if (!htmlContent) {
//     console.warn(`No content found for selector: ${selector}`);
//     return;
//   }

//   try {
//     const response = await fetch('http://localhost:5000/api/generate-pdf', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ html: htmlContent })
//     });

//     if (!response.ok) throw new Error('Failed to generate PDF');

//     // Receive the blob and download it
//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);

//     // Trigger download
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'document.pdf';
//     a.click();

//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     console.error('Error generating PDF:', err);
//   }
// }
