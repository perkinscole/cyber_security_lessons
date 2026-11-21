# What Cipher City collects

Cipher City adds nothing to what Ready4AI already holds about a person. It is a course on the platform, so `docs/compliance/` in Ready4AI applies to it in full. This page lists what the course itself saves, so the privacy page and the data schedule can say so. The plug-in script adds the two sections at the bottom to those documents.

## About students

| Data | Held? | Detail |
| --- | --- | --- |
| Name, username, passcode | By the platform, as for every course | A display name, a username unique in the class, and a passcode stored only as a hash. No email, no Google account. |
| Schoolwork | Yes | The code a student writes in each step, their partner-talk note, and their written reflection. |
| Progress | Yes | Which steps are done and in how many tries, quick-check answers (the first choice for each question, and whether it was right), the lesson rating, "confusing" marks, the operator they built, and reward-game seconds used. |
| Teacher's review | Yes | Rubric scores and written feedback. The student sees the feedback, not the scores. Classmates see neither. |
| Badges given by the teacher | Yes | The badge and an optional note. |
| Help requests | Yes | Lesson, step and an optional note. One open request for each student, deleted when the teacher marks it helped. |
| A count of code runs | Yes | How many times the student pressed Run in the current minute, to stop a runaway. Reset every minute. |
| Anything else | No | No email, birth date, address, photo, voice, location or device details. |

XP, levels, badges earned by working, and the class city are worked out from the rows above each time they are shown. They are not stored.

## Things worth saying plainly

- **Student code is run in two places and sent nowhere else.** In the student's browser it runs inside a locked frame that cannot make any network request or read the page around it. On the server it runs again inside a sealed engine with no files, no network and no access to other data, on a thread of its own, with a time and memory limit. It is never sent to an AI model or to any other company.
- **Every target is pretend.** The lockers, logins, inboxes, networks and logs in the lessons are a few lines of code inside the lesson. No lesson contacts, scans or tests any real system, and nothing in the course can.
- **Made-up passwords only.** Lessons about passwords use invented ones, and every such step says "Never type a real password". Whatever a student types in a code box is saved as schoolwork and can be read by their teacher, which is one more reason for the warning.
- **Nothing is loaded from another site.** No fonts, scripts, pictures or videos from anywhere else. A browser test fails the build if any page makes a request to another site.
- **The class screen and the feedback report carry no scores and no rubric data.** The screen shows first names of students who finished a lesson, as the other courses do. The feedback report has no names at all.
- **Demo mode** (`?demo`) uses made-up students and keeps everything in the browser. Nothing is sent.

## Deleting and exporting

The course's five tables (`cc_work`, `cc_student`, `cc_review`, `cc_award`, `cc_help`) hang off the platform's student and class rows. So every deletion the platform already has also removes the Cipher City data, with no extra step:

- a teacher removing a student, deleting a class, or deleting their account;
- the daily clean-up of finished and unused classes and accounts.

A teacher can download everything held about a class from the class's Settings tab. Tests prove each of these against a real database.

## Section added to the privacy page

> **In Cipher City**
> - Students write short programs. Their code is saved with their work so their teacher can read it.
> - To check a step, the code runs in the student's browser inside a locked box that cannot reach the internet, and again on our server inside a sealed engine with no network and no files. It is not sent anywhere else.
> - Every lock, sign-in, inbox and network in the lessons is pretend and is built into the lesson. Nothing in Cipher City contacts, scans or tests a real system.
> - Lessons use made-up passwords only. Students are told on screen never to type a real one.

## Section added to the data schedule

> **Cipher City.** Schoolwork is the code written in each step, a partner-talk note and a written reflection. Progress also includes how many tries each step took, the first answer to each quick-check question, and reward-game seconds used. A count of code runs in the current minute is kept to limit runaway programs. Student code is run in the browser in a frame with no network access, and again on the server in a sealed engine with no network or file access; it is sent to no other party. The course loads nothing from any other site and has no connection to another company.
