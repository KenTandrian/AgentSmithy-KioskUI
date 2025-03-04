import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { v4 as uuid } from 'uuid'; 
export interface Message {
  body: string,
  botAnswer?: any,
  type: string,
  responseTime?: string
  botStartTime?: string;
  chat_id?: string
}

const SESSION_KEY = "sampleid"
@Injectable({
  providedIn: 'root'
})

export class BroadcastService {

  initialChatQuery: Message;
  chatQuery$: Subject<Message>;

  constructor( private http: HttpClient,) {
    this.chatQuery$ = new Subject<Message>();
  }

  nextChatQuery(chatQuery: Message) {
    this.chatQuery$.next(chatQuery);
  }

  postChat(query: string): Observable<any> {
    query = query.replace(/\s+/g, " ").trim();
    const body: any = 
      {
        "messages": [
            {
                "content": query,
                "type": "human"
            }
        ],
        "session_id": this.getSession()!
    }
    
    return this.http.post<any>(
      "https://test-agent-runtime-599247973214.us-central1.run.app/chats", body);
  }

  getSession(): string | null {
    return sessionStorage.getItem(SESSION_KEY);
  }

  createSession() {
    sessionStorage.setItem(SESSION_KEY, uuid())
  }
}
