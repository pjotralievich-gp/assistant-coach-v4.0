
export function saveSheetUrl(url: string){
  localStorage.setItem('coach:sheetURL', url)
  return { ok:true }
}
export function getSheetUrl(): string | null { return localStorage.getItem('coach:sheetURL') }
export async function createRecoverySheet(){ await new Promise(r=>setTimeout(r,300)); return { ok:true, created:true } }
