
import React, { useState } from 'react'
import './MedLab.css'

export default function MedLab(){
  const [messages,setMessages]=useState([{from:'ai',text:'Welcome to MedLab AI. Attach a PDF blood test to get a quick interpretation.'}])
  const [input,setInput]=useState('')
  const [fileName,setFileName]=useState<string|null>(null)

  const send=()=>{
    if(!input && !fileName) return
    setMessages(m=>[...m,{from:'user',text: input || `📎 File: ${fileName}`},{from:'ai',text:'✅ File received. Processing (demo)...'}])
    setInput(''); setFileName(null)
  }
  return (
    <div className="medlab-root">
      <h2 className="section-title">🧪 MedLab</h2>
      <div className="medlab-chat-box">
        {messages.map((m,i)=>(<div key={i} className={'medlab-message '+m.from}>{m.text}</div>))}
      </div>
      <div className="medlab-input-row">
        <input id="up" type="file" accept=".pdf" onChange={e=>{const f=e.target.files?.[0]; if(f) setFileName(f.name)}} style={{display:'none'}}/>
        <label htmlFor="up" className="attach-button">📎</label>
        <input className="medlab-input" placeholder="Type a note… or attach file" value={input} onChange={e=>setInput(e.target.value)} />
        <button className="send-button" onClick={send}>Send</button>
      </div>
    </div>
  )
}
