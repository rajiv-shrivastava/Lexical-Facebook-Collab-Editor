let counter = 1;
const recycledNumbers: number[] = [];

export function getNextPageBreakNumber(exist:any): number {
  if (recycledNumbers.length > 0) {
    return recycledNumbers.shift()!;
  }
  if(exist){
    return exist++
  }else{
    return counter++;

  }
}

export function recyclePageNumber(pageNumber: number): void {
  recycledNumbers.push(pageNumber);
  recycledNumbers.sort((a, b) => a - b); // Optional, to reuse smallest first
}

export function resetPageBreakCounter(): void {
  counter = 1;
  recycledNumbers.length = 0;
}

export function setPageBreakCounter(value: number): void {
  counter = value;
}
