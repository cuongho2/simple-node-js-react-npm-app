# TemplateNodeJS

TemplateNodeJS project

## Discription

##. hapijs
##. mysql
##. swagger
##. eslint

## Installation

####1. Clone this project or Download that ZIP file
####2. Make sure you have [npm](https://www.npmjs.org/) installed globally

More details here
https://nodejs.org/en/download/

####// note:

-   Create .env base on .env-template

####3. On the command prompt run the following commands

```sh
$ cd `project-directory`
```

```sh
$ npm install
```

```sh
$ npm start
```

## Try http://localhost:5001/documentation

https://op.youjiuhealth.com/?lang=zh
ID : harryhung810@gmail.com
pass：123456

curl -X POST "https://open.youjiuhealth.com/api/session?app_id=699871606176812&app_secret=NjliY2MwZDcxNzg3Y2U3NGFkNGU5YzRkZThkNWFmZTc2MDEwNWY2Zg" -H "accept: application/vnd.XoneAPI.v2+json"

{"access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvb3Blbi55b3VqaXVoZWFsdGguY29tXC9hcGlcL3Nlc3Npb24iLCJpYXQiOjE2NTAzNjM0NjMsImV4cCI6MTY1MDM2NzA2MywibmJmIjoxNjUwMzYzNDYzLCJqdGkiOiJ3ZmRSMnlJb2RxMVdlcE02Iiwic3ViIjoxMDY0MiwicHJ2IjoiZGMwOTQ0NWY1ZTAzMjg4OTczYWRlMTUzOGE5YWViYTJlMmZjYWRlMyJ9.Q-OSPrztfTCWRd2xrwkC4mTCqGCJ0O6-EFPbEmwHXYo","token_type":"bearer","expires_in":3600}

curl -X GET "https://open.youjiuhealth.com/api/reports" -H "accept: application/vnd.XoneAPI.v2+json" -H "Authorization: Bearer Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvb3Blbi55b3VqaXVoZWFsdGguY29tXC9hcGlcL3Nlc3Npb24iLCJpYXQiOjE2NTEyOTIxODMsImV4cCI6MTY1MTI5NTc4MywibmJmIjoxNjUxMjkyMTgzLCJqdGkiOiI5TlRMWnNuSzRld2RaTFJRIiwic3ViIjoxMDY0MiwicHJ2IjoiZGMwOTQ0NWY1ZTAzMjg4OTczYWRlMTUzOGE5YWViYTJlMmZjYWRlMyJ9.\_Ma8NkoJWl14qAMDlAAID1iJbtQPbZC915caCfcoGrw"

curl -X GET "https://open.youjiuhealth.com/api/reports/166449849" -H "accept: application/vnd.XoneAPI.v2+json" -H "Authorization: Bearer Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvb3Blbi55b3VqaXVoZWFsdGguY29tXC9hcGlcL3Nlc3Npb24iLCJpYXQiOjE2NTE4MjgzNjMsImV4cCI6MTY1MTgzMTk2MywibmJmIjoxNjUxODI4MzYzLCJqdGkiOiIxSFpQaG9GVERnSTV6Y2laIiwic3ViIjoxMDY0MiwicHJ2IjoiZGMwOTQ0NWY1ZTAzMjg4OTczYWRlMTUzOGE5YWViYTJlMmZjYWRlMyJ9.fitwuos7d09RhpQceSQj6FE4mxq4pwmibGJSfF2ueSk"

<!-- note dung node 14.18.0 -->
