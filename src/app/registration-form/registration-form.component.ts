import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import * as lodash from 'lodash'
import { catchError } from 'rxjs/operators';
import { AuthService } from  '../auth/auth.service';
import { StorageService, UserData } from '../storage/storage.service';
import {firestore} from 'firebase/app';




@Component({
  selector: 'registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit {
  page=1;
  numPages=3;
  attemptNext=false;

  needGithubLink=false;
  needResume=false;

  //have to list all the properties out for AOT compiler
  inputFirstName;
  inputLastName;
  inputEmail;
  inputPhone1;
  inputPhone2;
  inputPhone3;
  inputMonth;
  inputDay;
  inputYear;
  pickGender;
  ethnicity;
  schoolInput;
  schoolInputText;
  studyLevel;
  graduationYear;
  specialAccomadations;
  shirtSize;
  haveGithub;
  haveResume;
  dietaryRestrictions;
  usingHardware;
  githubLinkInput;
  hardwareInput;
  hardwareInputText;
  termsDataSharing;
  termsCodeOfConduct;
  satisfactionRange;
  questionsComments;


  checkGithubProfile;

  valuesImInterestedIn=[
    "inputFirstName",
    "inputLastName",
    "inputPhone1",
    "inputPhone2",
    "inputPhone3",
    "inputMonth",
    "inputDay",
    "inputYear",
    "pickGender",
    "ethnicity",
    "schoolInput",
    "schoolInputText",
    "studyLevel",
    "graduationYear",
    "specialAccomadations",
    "shirtSize",
    "dietaryRestrictions",
    "githubLinkInput",
    "hardwareInput",
    "hardwareInputText",
    "satisfactionRange",
    "questionsComments"
  ]

  schoolList=[
    ["Milburn High School"],
    ["Montgomery High School"],
    ["Bergen County Academies"],
    ["Princeton High School", "PHS"],
    ["Freehold High School"],
    ["Robbinsville High School"],
    ["HightsTown High School"],
    ["Stuyvesant High School"],
    ["East Stroudsburg High School"],
    ["Livingston High School"],
    ["Princeton Day School", "PDS"],
    ["Noor-ul-Iman", "Noor ul Iman"],
    ["Wardlaw + Hartridge School"],
    ["South Brunswick High School"],
    ["Ridge High School"],
    ["West Windsor Plainsborough High North", "WWP", "North"],
    ["West Windsor Plainsborough High South", "WWP", "South"],
    ["Middlesex County Academy"],
    ["Perth Amboy Vocational Technical School"],
    ["Raritan High School"],
    ["Pennington School"],
    ["Manav Rachna International"],
    ["Edison Academy"],
    ["Port Credit Secondary School"],
    ["John P. Stevens High School", "J.P. Stevens"]
  ];

  hardwareList=[
    ["Servos"],
    ["Motors"],
    ["Arduino or other microcontrollers", "ESP", "ESP-32"]
  ]

  constructor(private cdr: ChangeDetectorRef, private httpClient: HttpClient, public authService:  AuthService, public userData: UserData, public storageService: StorageService) { }

  ngOnInit() {
    this.haveGithub="No";
    this.haveResume="No";
    this.usingHardware="No";
    this.checkGithubProfile=lodash.throttle(this.sendCheckGithubProfile, 2000);
  }

  nextPage() {
    if(this.checkPage()){
      this.attemptNext=false;
      this.page+=1;
    }
  }

  prevPage() {
    this.attemptNext=true;
    this.page-=1;
  }
  checkPage() {
    this.attemptNext=true;
    this.cdr.detectChanges();
    //console.log(document.getElementsByClassName("alert"))
    return document.getElementsByClassName("alert").length==0;
  }
  submitting(dict) {

    var dataDict=Object.assign({}, dict);

    for(var i=0; i<this.valuesImInterestedIn.length; i++){
      if(dataDict[this.valuesImInterestedIn[i]]===undefined){
        dataDict[this.valuesImInterestedIn[i]]="";
      }
    }

    this.userData.isFullyLoggedIn=true;
    this.userData.uid=this.authService.userUid;
    this.userData.firstName=dataDict["inputFirstName"];
    this.userData.lastName=dataDict["inputLastName"];
    this.userData.fullName=dict["inputFirstName"]+" "+dict["inputLastName"];
    this.userData.phone=dict["inputPhone1"]+"-"+dict["inputPhone2"]+"-"+dict["inputPhone3"];
    this.userData.dateOfBirth=dict["inputYear"]+"-"+dict["inputMonth"]+"-"+dict["inputDay"];
    this.userData.gender=dataDict["pickGender"];
    this.userData.ethnicity=dataDict["ethnicity"];
    if(dataDict["schoolInputText"]) {
      this.userData.school=dataDict["schoolInputText"];
      this.userData.schoolNotInList=true;
    } else {
      this.userData.school=dataDict["schoolInput"];
      this.userData.schoolNotInList=false;
    }
    this.userData.studyLevel=dataDict["studyLevel"];
    this.userData.graduationYear=dataDict["graduationYear"];
    this.userData.specialAccomadations=dataDict["specialAccomadations"];
    this.userData.shirtSize=dataDict["shirtSize"];
    this.userData.dietaryRestrictions=dataDict["dietaryRestrictions"];
    this.userData.githubLink=dataDict["githubLinkInput"];
    this.userData.hardware=dataDict["hardwareInput"];
    if(dataDict["hardwareInputText"].includes("Other")) {
      this.userData.hardware+=", "+dataDict["hardwareInputText"];
    }
    if(dataDict["satisfactionRange"]==""){
      this.userData.satisfaction=dataDict["satisfactionRange"];
    } else {
      this.userData.satisfaction=dataDict["satisfactionRange"];
    }
    this.userData.questionsComments=dataDict["questionsComments"];
    this.userData.dateCreated=firestore.Timestamp.fromDate(new Date());
    console.log(this.userData);
    this.storageService.createUser(this.userData);

  }
  autoTab(event, nextInput) {
    const getMethods = (obj) => {
      let properties = new Set();
      let currentObj = obj;
      do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
      } while ((currentObj = Object.getPrototypeOf(currentObj)))
      return [...properties.keys()].filter(item => typeof obj[item] === 'function')
    }
    let input = event.target;
    let length = input.value.length;
    let maxLength = input.attributes.maxlength.value;
    if (length >= maxLength) {
      document.getElementById(nextInput).focus();
    }
  }
  validateDate(monthObj,dayObj,yearObj) {
    let month=monthObj.value;
    let day=dayObj.value;
    let year=yearObj.value;
    if(month && day && year){
      var mom=moment(year+"-"+month+"-"+day, "YYYY-MM-DD")
      return  mom.isValid() && mom.year()>1900 && mom.isBefore(moment());
    }
    //one of the fields is empty, so we ignore it
    return true
  }
  setRadio(dom, set) {
    dom.value=set;
  }
  sendCheckGithubProfile(gitlink){
    if(!gitlink.errors){
      var smallString=gitlink.value;
      gitlink.loading=true;
      this.httpClient.get("https:\/\/api.github.com/users/"+smallString.split("/")[3]).subscribe(
        data => {gitlink.badProfile=false; gitlink.profileData=gitlink.value; gitlink.loading=false;},
        error => {gitlink.badProfile=true; gitlink.profileData=gitlink.value; gitlink.loading=false;}
      );
    } else {
      gitlink.badProfile=true;
    }
  }

}
