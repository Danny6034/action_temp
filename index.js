// @ts-nocheck
const core = require('@actions/core');
const github = require('@actions/github');
var postComment = require('./src/build/artiaApi/Comments/postComment.js');
var createActivity = require('./src/build/artiaApi/Activity/createActivity.js');
const event = github.context.eventName;
// // Get the JSON webhook payload for the event that triggered the workflow//
const payload            = JSON.stringify(github.context.payload, undefined, 2) 
const objPayload         = JSON.parse(payload)
const organizationId     = core.getInput('organizationId') //OrganizationId é o id da empresa/organização cadastrada no artia. (informado no main.yml do workflow)
const accountId          = core.getInput('accountId') //AccountId é o id do grupo de trabalho. (informado no main.yml do workflow)
const creatorEmail       = core.getInput('creatorEmail') //Email criador do comentário (informado no main.yml do workflow).
const creatorPassword    = core.getInput('creatorPassword')//Password (Váriavel de ambiente{sescrets.ARTIA_PASSWORD} informada no main.yml do workflow).
const folderId           = core.getInput('folderId')//Id da pasta ou do projeto. 

try {

switch (event){

  case 'push':
    const pushActivityId     = objPayload.commits[0].message.split('[').pop().split(']')[0]; 
    const pushContent        = `Autor: ${objPayload.head_commit.author.name}  | Tipo: Push | Mais informações no GitHub: ${objPayload.compare}`
    var newComment           = postComment(organizationId, accountId, pushActivityId, creatorEmail, creatorPassword, pushContent);
  break;
  
  case 'pull_request':
    const pullRequest    = objPayload.pull_request;  
    const prActivityId   = pullRequest.title.split('[').pop().split(']')[0]; // returns ActivityId
    const prContent      = `Autor: '${pullRequest.user.login} | Tipo: Pull Request | ${pullRequest.body.replace('[ ]','')} | Mais informações no GitHub: ${pullRequest.url}`  
    var newComment       = postComment(organizationId, accountId, prActivityId, creatorEmail, creatorPassword, prContent);
  break;

  case 'issues':      
    const issue             = objPayload.issue; 
    const description       = issue.body;
    const categoryText      = (issue.labels.lenght > 0 ? issue.labels[0].name : "");
    const estimatedEffort   = issue.title.split('[').pop().split(']')[0];
    const title             = issue.title.replace('[','').replace(']','').replace(estimatedEffort,'')
    var newActivity         = createActivity(organizationId, accountId, folderId, title, description, categoryText, estimatedEffort, creatorEmail, creatorPassword);
  break;
    
  }

} catch (error) {
  core.setFailed(error.message);
}






