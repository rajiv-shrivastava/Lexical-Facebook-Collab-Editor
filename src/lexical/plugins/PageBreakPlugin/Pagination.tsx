import React, { useEffect, useState } from 'react';
import $ from 'jquery';

const CountParagraphs = () => {
  const [paragraphCount, setParagraphCount] = useState(0);
  const [page,setPage] = useState(true)
  let count = 0
  let pTagCount: React.SetStateAction<any>;


  const countParagraphs = () => {
    if(page){
      count = $('p').length-1;
      insertPage()
    }else{
      count = 0;
    }
    setParagraphCount(count)
    
  };

  const insertPage = ()=>{
    if(count % 20 === 0){
        const btn =  document.getElementById('pagination')
        if(btn){
          btn.click()
        }
      }
  }
  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      countParagraphs();
    }
  
    if (event.key === 'Backspace') {
      const totalParagraphs = $('p').length - 1;
      const totalPages = Math.ceil(totalParagraphs / 20);
      
      if (totalParagraphs > 18 && totalPages <= 1) {  
        setTimeout(() => {
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(enterEvent);
        }, 1000); // 1000ms = 1 second
      }
    }
  };
  
  
  

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    countParagraphs();

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div >
      <div>
        <h3 style={{display:'none'}}>{'<p> tags count '}{paragraphCount}</h3>
      </div>
    </div>
  );
};

export default CountParagraphs;
