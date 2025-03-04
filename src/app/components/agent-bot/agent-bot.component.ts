import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, timeout } from 'rxjs';
import { Message, BroadcastService } from '../../services/broadcast.service';


export type DialogQuestion = {
  questionId: string,
  questionText: string,
  hasChip: boolean,
  options: string[],
  questionSequence: string,
  answer: string
}

@Component({
  selector: 'app-agent-bot',
  templateUrl: './agent-bot.component.html',
  styleUrl: './agent-bot.component.scss'
})
export class AgentBotComponent implements OnInit {
  chatQuery: string
  chatQuery$: Observable<Message>;
  showLoader: boolean = false;
  startTimer: boolean = false;
  conversation: Message[] = [];

  loaderTextArray = [""];
  loaderTextTimeout: undefined | ReturnType<typeof setTimeout>;
  loaderText = this.loaderTextArray[Math.round(Math.random() * 10)];
  loaderTextIndex = 0;
  loaderIndex = 1;
  followUpQuestions: DialogQuestion[] = [];
  // ticketfollowUpQuestions: DialogQuestion[] = [];
  ticketCreationFlow: boolean = false;
  isChatDisabled: boolean = false;
  options: string[] = [];
  botStartTime: number;
  currentFollowUpQuestion: DialogQuestion;
  initialQuestion: string;
  ticketId: string;
  // categoryIntent: string = INTENT_DEFAULT_VALUE;
  changeImageInterval: undefined | ReturnType<typeof setTimeout>;
  panelOpenState = false;
  like = false;
  dislike = false;
  response: Response
  email: string;
  currentRole: string;
  appRole: string;
  generatingText: string = "Generating";

  feedbackOptions = [{ name: "Inaccurate information", selected: false }, { name: "Insufficient information", selected: false }, { name: "Links not working", selected: false }, { name: "Suggested questions not relevant", selected: false }];
  loaderFeedbackOptions = [...this.feedbackOptions];
  feedbackOptionsArray: any[] = [];
  feedback: any[] = [];
  selectedFeedbackChip: any[] = [];
  loaderSelectedChip = '';
  loaderFeedback = '';
  showLoaderLikeDislikeButtons = false;
  outOfContextAnswerResponseObject = {
    like: false,
    dislike: false
  }
  showSuggesstion = false;
  suggestedQuestionMessage: Message;
  loader_chat_id: any;
  questionArray: any[] = [];

  /** DEP accordion border colors */
  borderColors = ['#4285F4', '#0F9D58', '#F4B400', '#DB4437'];

  depInitialQuestion = false;
  leftContainerClass: string;
  rightContainerClass: string;
  selectedAgentData:any;


  constructor(
    private router: Router,
    private broadcastService: BroadcastService,
  ) {
    this.chatQuery$ = this.broadcastService.chatQuery$
    this.chatQuery$.subscribe((value: any) => {
      this.conversation.push(value);
    });
    this.chatQuery = this.broadcastService.initialChatQuery?.body;
    this.submitMessage(this.broadcastService.initialChatQuery);
    this.broadcastService.createSession();
  }


  ngOnInit(): void {
    let agentData = JSON.parse(localStorage.getItem('agentData') || '{}');
    this.selectedAgentData = {
      agentName: agentData[0].agentName ? agentData[0].agentName : '-',
      runTime: agentData[1].runTime ? agentData[1].runTime : '',
      frameWork: agentData[2].framework ? agentData[2].framework : '-',
      model: agentData[4].model ? agentData[4].model : '-',
      tools: agentData[3].tools ? agentData[3].tools : '-',
    }
  }

  goToExport() {
    this.router.navigate(['/export']);
  }

  async submitMessage(event: any) {

    this.generatingText = "Generating";
    this.pushQuestion(this.chatQuery);

    this.botStartTime = new Date().getTime();
    // keeps the scrollbar to the bottom
    const parentElement = document.getElementsByClassName('chat-body');
    parentElement[0]?.scrollTo(0, parentElement[0].scrollHeight);

    if (event instanceof KeyboardEvent || event instanceof MouseEvent) {
      event.preventDefault();
    }
    if (!this.chatQuery || this.chatQuery === '') {
      return;
    }
    if (!this.initialQuestion) this.initialQuestion = this.chatQuery;

    let singleMessage: Message = {
      body: this.chatQuery,
      type: 'human',
    }

    this.conversation.unshift(singleMessage);

    const answer = this.chatQuery;
    this.chatQuery = '';


    this.showLoader = true;
    this.setTimeoutForLoaderText();
    this.setCyclicBackgroundImages();
    this.broadcastService.postChat(singleMessage.body).pipe(timeout(90000)).subscribe({
      next: (response: any) => this.handleBotResponse(response),
      error: (err) => {
        this.setErrorMessage();
      }
    })
  }


  navigateToExport(){
    this.router.navigate(["export"]);
  }
  assignId(id: any) {
    for (let i = 0; i < this.questionArray.length; i++) {
      if (!this.questionArray[i].id) {
        this.questionArray[i].id = id;
        break;
      }
    };
  }

  getStringData(obj: any): string {
    let str = (obj as string);
    if (str === "" || str.length === 0) {
      return "Sorry! I don't have sufficient information to answer this question at the moment.";
    }
    return (obj as string);
  }

  handleBotResponse(response: any) {

    let endTime = new Date().getTime();
    let outOfContextQuestion = false;
    this.assignId(response?.chat_id);
    response?.botAnswer?.forEach((msg: { type: string; data: { content: any; }; }) => {
      if (msg?.type === 'textData' && this.getStringData(msg?.data?.content) == ("I can only answer questions related to Google Cloud.")) {
        this.outOfContextAnswerResponseObject.like = false;
        this.outOfContextAnswerResponseObject.dislike = false;
        this.clearTimeoutForLoaderText();
        this.setAnswerNotFoundText(this.getStringData(msg?.data?.content));
        outOfContextQuestion = true;
        // this.setSuggestedQuestionInChat(response, endTime);
        this.loader_chat_id = response.chat_id;
      }
    });

    if (!outOfContextQuestion) {
      let singleMesage: Message = {
        body: "",
        botAnswer: response.botAnswer,
        type: 'bot',
        responseTime: ((endTime - this.botStartTime) / 1000).toString(),

        botStartTime: this.botStartTime.toString(),
        chat_id: response.chat_id
      };

      this.followUpQuestions = response.followUpQuestions;



      this.showLoader = false;
      this.clearTimeoutForLoaderText();

      this.followUpQuestions = this.followUpQuestions ?? [];
      if (this.followUpQuestions.length === 0) {
        return;
      }
      this.makeFollowUpQuestion();
      if (!this.depInitialQuestion) {
        this.depInitialQuestion = true;
      }
    }
  }


  pushQuestion(question: string, id?: any) {
    this.questionArray.push({ question, id });
  }



  setCyclicBackgroundImages() {
    if (this.loaderTextIndex == 3) {
      this.loaderTextIndex = 0;
    }
    this.leftContainerClass = 'left-side-container-' + (this.loaderTextIndex + 1);
    this.rightContainerClass = 'right-side-container-' + (this.loaderTextIndex + 1);
    this.loaderTextIndex++;
  }

  setTimeoutForLoaderText() {
    this.loaderText = this.loaderTextArray[Math.round(Math.random() * 10)];
    this.showLoaderLikeDislikeButtons = false;
    this.loaderTextTimeout = setInterval(() => { this.setCyclicLoaderText(); }, 3000);
  }

  clearTimeoutForLoaderText() {
    clearTimeout(this.loaderTextTimeout);
  }

  setCyclicLoaderText() {
    this.loaderText = this.loaderTextArray[Math.round(Math.random() * 10)];
    this.loaderIndex++;
  }

  setErrorMessage() {
    this.clearTimeoutForLoaderText();
    this.leftContainerClass = 'left-side-container-error';
    this.loaderText = 'Oops something went wrong , please try again and if the issue persists let us know the issue via the feedback button in the header.';
    this.generatingText = "";
    this.rightContainerClass = 'right-side-container-error';
    this.showLoaderLikeDislikeButtons = false;
  }

  setAnswerNotFoundText(loaderText: string) {
    this.clearTimeoutForLoaderText();
    this.generatingText = "";
    this.showLoader = true;
    this.leftContainerClass = 'answer-not-found';
    this.rightContainerClass = 'right-side-container-error';
    this.loaderText = loaderText + " Please try asking something else";
    this.showLoaderLikeDislikeButtons = true;
  }

  makeFollowUpQuestion() {

    this.ticketCreationFlow = true;
    this.currentFollowUpQuestion = this.followUpQuestions?.shift()!;

    let singleMessage: Message = {
      body: this.currentFollowUpQuestion.questionText,
      type: 'bot',
    };
    this.conversation.unshift(singleMessage);

    this.isChatDisabled = this.currentFollowUpQuestion?.hasChip!;

  }

}
