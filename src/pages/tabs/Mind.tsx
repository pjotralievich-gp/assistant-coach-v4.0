
import React, { useState } from 'react'
import './Mind.css'

export default function Mind(){
  const [messages,setMessages]=useState([{from:'ai',text:'Mind — your sports psychologist. How are you feeling today?'}])
  const [input,setInput]=useState('')

  const send=()=>{
    if(!input.trim()) return
    setMessages(m=>[...m,{from:'user',text:input},{from:'ai',text:'Noted. Let’s plan a short breathing exercise (demo).'}])
    setInput('')
  }
  return (
    <div className="mind-root">
      <h2 className="section-title">🧠 Mind</h2>
      <div className="chatbox">
        {messages.map((m,i)=>(<div key={i} className={'msg '+m.from}>{m.text}</div>))}
      </div>
      <div className="inputrow">
        <input className="input" placeholder="Share your thoughts… (Press Enter to send)" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} />
        <button className="primary-btn" onClick={send}>Send</button>
      </div>
    </div>
  )
}
