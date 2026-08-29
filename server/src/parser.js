import fs from 'node:fs/promises';
import path from 'node:path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import XLSX from 'xlsx';

const dateRe=/(\d{1,2})[\/月年.-](\d{1,2})/;
const timeRe=/(上午|下午|晚上|早上|中午|晚餐後|晚餐)?\s*(\d{1,2})(?::|：)(\d{2})/;
function normalize(text){return text.replace(/\r/g,'').split('\n').map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);}
function classify(title){return /餐|食堂|拉麵|燒肉|披薩|鬆餅|飯糰|小吃|塔可|早餐|晚餐|甜點/.test(title)?'美食':'景點';}
function parseLines(lines){let date='';return lines.map((line,index)=>{const dm=line.match(dateRe);if(dm)date=`${dm[1]}/${dm[2]}`;const tm=line.match(timeRe);const title=line.replace(dateRe,'').replace(timeRe,'').replace(/^[-•：:、\s]+/,'').trim();if(!title||title.length<2)return null;return {date,time:tm?`${tm[1]||''}${tm[2]}:${tm[3]}`:'',title,description:'',category:classify(title),sort_order:index};}).filter(Boolean);}
export async function extractText(filePath,ext){if(ext==='.docx'){const r=await mammoth.extractRawText({path:filePath});return r.value;}if(ext==='.pdf'){const r=await pdfParse(await fs.readFile(filePath));return r.text;}if(['.xlsx','.xls','.csv'].includes(ext)){const book=XLSX.readFile(filePath);return book.SheetNames.flatMap(n=>XLSX.utils.sheet_to_json(book.Sheets[n],{header:1,raw:false}).map(row=>row.join(' '))).join('\n');}if(['.txt','.md'].includes(ext))return fs.readFile(filePath,'utf8');throw new Error('圖片檔需要 OCR，目前請先使用 Word、PDF 或 Excel');}
export async function parseItinerary(filePath,originalName){const ext=path.extname(originalName).toLowerCase();const text=await extractText(filePath,ext);const items=parseLines(normalize(text));if(!items.length)throw new Error('找不到可辨識的行程內容');return {items,sourceName:originalName};}
