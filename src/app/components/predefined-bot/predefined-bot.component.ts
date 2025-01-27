import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-predefined-bot',
  templateUrl: './predefined-bot.component.html',
  styleUrl: './predefined-bot.component.scss'
})
export class PredefinedBotComponent {
  formGroup: FormGroup;
    selectedRuntime: string = 'resoningEngine';
    selectedFramework: string = 'langchain';
    selectedTools: string = 'api';
    selectedModel: string = 'gemini';

    constructor(private _formBuilder: FormBuilder, private router: Router) { }
  
    get formArray(): AbstractControl | null { return this.formGroup.get('formArray'); }
  
  
    ngOnInit() {
      this.formGroup = this._formBuilder.group({
        formArray: this._formBuilder.array([
          this._formBuilder.group({
            agentName: ['', Validators.required],
            agentType: ['', Validators.required],
            industry: ['', Validators.required],
          }),
          this._formBuilder.group({
            runTime: ['', Validators.required]
          }),
          this._formBuilder.group({
            framework: ['', Validators.required]
          }),
          this._formBuilder.group({
            tools: ['', Validators.required]
          }),
          this._formBuilder.group({
            model: ['', Validators.required]
          }),
        ])
      });
    }
  
    selectRunTime(value: string) {
      console.log(value);
      this.selectedRuntime = value;
    }
  
    selectFramework(value: string) {
      console.log(value);
      this.selectedFramework = value;
    }
  
    selectTools(value: string) {
      console.log(value);
      this.selectedTools = value;
    }
  
    selectModel(value: string) {
      console.log(value);
      this.selectedModel = value;
    }
  
    goToHome() {
      this.router.navigate(['/']);
    }
}
