
import React, { useState } from 'react'
import './PhysioAssistant.css'

export default function PhysioAssistant(){
  const [messages,setMessages]=useState([{from:'ai',text:'Hi! I am your PhysioAssistant. Ask me about training load & energy systems.'}])
  const [input,setInput]=useState('')

  const send=()=>{
    if(!input.trim()) return
    setMessages(m=>[...m,{from:'user',text:input},{from:'ai',text:'Auto-reply (demo): thanks, I will analyze this training.'}])
    setInput('')
  }
  return (
    <div className="physio-root">
      <h2 className="section-title">🩺 PhysioAssistant</h2>
      <div className="chatbox">
        {messages.map((m,i)=>(<div key={i} className={'msg '+m.from}>{m.text}</div>))}
      </div>
      <div className="inputrow">
        <input className="input" placeholder="Type your question... (Press Enter to send)" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} />
        <button className="primary-btn" onClick={send}>Send</button>
      </div>
    </div>
  )
}
