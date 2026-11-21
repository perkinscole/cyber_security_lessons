# Scope and sequence

Written by `node tools/scope.mjs` from the lesson files. Do not edit by hand.

Standards are from the Massachusetts Digital Literacy and Computer Science framework (2016), grades 6 to 8, quoted word for word. All three grades share one set of standards, so the courses spiral: grade 6 keeps yourself safe, grade 7 explains how attacks and defences work, grade 8 designs and tests defences. Each grade stands alone.

Every lesson has a mission, build steps, a four-question quick check and a written reflection, and is planned for one 40 to 50 minute period. "Code" is the number of build steps where the student writes or changes code; the rest are click-through labs. Every target in every lesson is pretend and lives inside the lesson.

## Grade 6: Lock It Down

Keep yourself safe. Finish and change code that is already started.

| # | Lesson | Question of the day | Students can say | Code | Career | Standards |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Welcome, Agent | What makes a hacker helpful or harmful? | I can explain why permission is the difference between helpful and harmful hacking. | 3 of 4 | Bug bounty hunter | 6-8.CAS.b.8, 6-8.CAS.b.6 |
| 2 | What to Keep Private | Which facts about you are safe to share? | I can sort facts about a person into "share" and "keep private", and explain why. | 3 of 4 | Privacy officer | 6-8.CAS.a.3, 6-8.CT.b.1 |
| 3 | Guess the PIN | Why is a longer PIN safer? | I can explain why every extra digit makes a PIN harder to guess. | 3 of 4 | Security tester | 6-8.CAS.a.1, 6-8.CT.b.2 |
| 4 | Password Strength Checker | What makes a password hard to guess? | I can name three things that make a password strong, and check for them with code. | 3 of 4 | Security engineer | 6-8.CAS.a.1, 6-8.CT.d.4 |
| 5 | Passphrase Machine **(project)** | How can a password be both strong and easy to remember? | I can make a strong passphrase and explain why a second sign-in step keeps an account safer. | 3 of 4 | Identity manager | 6-8.CAS.a.1, 6-8.CT.d.3 |
| 6 | Spot the Fake | How can you tell when a message is a fake? | I can spot three signs of a fake message, and I know what to do when I see one. | 3 of 4 | Email security analyst | 6-8.CAS.a.1, 6-8.CAS.c.4 |
| 7 | Secret Codes | How can a message stay secret while it travels? | I can scramble and unscramble a message with a shift cipher, and explain how letters become numbers. | 4 of 4 | Cryptographer | 6-8.CS.c.3, 6-8.CT.c.1 |
| 8 | Bugs, Viruses and Updates | Why do updates keep a computer safe? | I can explain how a virus spreads, how updates stop it, and how a scanner finds a bad file. | 3 of 4 | Malware analyst | 6-8.CAS.a.1, 6-8.CT.e.2 |
| 9 | Your Trail and Your Crew | What happens to a post after you send it? | I can pause before I post, and I know the steps to save and report an unkind message. | 3 of 4 | Trust and safety specialist | 6-8.CAS.a.2, 6-8.CAS.a.3, 6-8.CAS.a.4 |
| 10 | My Safety Kit **(project)** | How do my safety tools work together? | I can join three safety tools into one program with a menu, and explain it to someone else. | 3 of 4 | Security awareness trainer | 6-8.CT.d.3, 6-8.CAS.a.1 |

| Standard | Text | Lessons |
| --- | --- | --- |
| 6-8.CAS.a.1 | Identify threats and actively protect devices and networks from viruses, intrusion, vandalism, and other malicious activities. | 3, 4, 5, 6, 8, 10 |
| 6-8.CAS.a.2 | Describe how cyberbullying can be prevented and managed. | 9 |
| 6-8.CAS.a.3 | Explain the connection between the persistence of data on the Internet, personal online identity, and personal privacy. | 2, 9 |
| 6-8.CAS.a.4 | Describe and use safe, appropriate, and responsible practices (netiquette) when participating in online communities (e.g., discussion groups, blogs, social networking sites). | 9 |
| 6-8.CAS.b.6 | Demonstrate compliance with the school’s Acceptable Use Policy [AUP]. | 1 |
| 6-8.CAS.b.8 | Explain positive and malicious purposes of hacking. | 1 |
| 6-8.CAS.c.4 | Evaluate how media and technology can be used to distort, exaggerate, and misrepresent information. | 6 |
| 6-8.CS.c.3 | Describe how information, both text and non-text, is translated and communicated between digital devices over a computer network. | 7 |
| 6-8.CT.b.1 | Design solutions that use repetition and conditionals. | 2 |
| 6-8.CT.b.2 | Use logical reasoning to predict outputs given varying inputs. | 3 |
| 6-8.CT.c.1 | Demonstrate that numbers can be represented in different base systems (e.g., binary, octal, and hexadecimal) and text can be represented in different ways (e.g., American Standard Code for Information Interchange [ASCII]). | 7 |
| 6-8.CT.d.3 | Create a program, individually and collaboratively, that implements an algorithm to achieve a given goal. | 5, 10 |
| 6-8.CT.d.4 | Implement problem solutions using a programming language, including all of the following: looping behavior, conditional statements, expressions, variables, and functions. | 4 |
| 6-8.CT.e.2 | Use and modify simulations to analyze and illustrate a concept in depth (e.g., light rays/mechanical waves interaction with materials, genetic variation). | 8 |

## Grade 7: Crack the Case

How attacks and defences work. Write one short function at a time.

| # | Lesson | Question of the day | Students can say | Code | Career | Standards |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Think Like a Defender | How does a defender decide what to protect first? | I can rank the risks to a system and explain why permission matters. | 3 of 4 | Risk analyst | 6-8.CAS.a.1, 6-8.CAS.b.8, 6-8.CT.a.1 |
| 2 | Brute Force | How do you stop a program that can try every PIN? | I can write a brute force guesser and the lockout that stops it. | 3 of 4 | Penetration tester | 6-8.CAS.a.1, 6-8.CT.b.1, 6-8.CT.d.1 |
| 3 | Word List Attacks | Why is a common password a weak password? | I can write a word list guesser and a sign-up rule that refuses common passwords. | 3 of 4 | Access manager | 6-8.CAS.a.1, 6-8.CT.b.4 |
| 4 | Scrambled for Storage | How can a system check your password without keeping it? | I can write a sign-up and sign-in that never store the password itself. | 3 of 4 | Security engineer | 6-8.CAS.a.1, 6-8.CT.a.2 |
| 5 | Crack the Caesar **(project)** | How can a program read a secret message without the key? | I can write a Caesar cipher and a program that cracks it by trying every key. | 4 of 5 | Cryptanalyst | 6-8.CS.c.3, 6-8.CT.d.3, 6-8.CT.d.4 |
| 6 | Keys That Hold | What makes a key strong? | I can write a keyword cipher and show why a longer key is harder to crack. | 4 of 4 | Cryptographer | 6-8.CS.c.3, 6-8.CT.d.1 |
| 7 | The Phishing Detector | How can a program help people spot a fake message? | I can write and tune a detector that scores messages for signs of phishing. | 4 of 5 | Email security analyst | 6-8.CAS.a.1, 6-8.CAS.c.4, 6-8.CT.d.6 |
| 8 | How Malware Spreads | Why do updates matter so much? | I can use a simulation to show how updates slow the spread of malware. | 4 of 4 | Malware analyst | 6-8.CAS.a.1, 6-8.CT.e.2, 6-8.CT.e.3 |
| 9 | Listening on the Wire | Who can read what you send over public Wi-Fi? | I can tell which packets a listener can read, and write firewall rules. | 3 of 4 | Network security engineer | 6-8.CAS.a.1, 6-8.CS.c.3 |
| 10 | Case File **(project)** | What does a security tester owe the owner? | I can test five pretend systems and plan a report that tells the owner how to fix them. | 4 of 5 | Security consultant | 6-8.CAS.b.8, 6-8.CAS.b.6, 6-8.CT.b.3 |

| Standard | Text | Lessons |
| --- | --- | --- |
| 6-8.CAS.a.1 | Identify threats and actively protect devices and networks from viruses, intrusion, vandalism, and other malicious activities. | 1, 2, 3, 4, 7, 8, 9 |
| 6-8.CAS.b.6 | Demonstrate compliance with the school’s Acceptable Use Policy [AUP]. | 10 |
| 6-8.CAS.b.8 | Explain positive and malicious purposes of hacking. | 1, 10 |
| 6-8.CAS.c.4 | Evaluate how media and technology can be used to distort, exaggerate, and misrepresent information. | 7 |
| 6-8.CS.c.3 | Describe how information, both text and non-text, is translated and communicated between digital devices over a computer network. | 5, 6, 9 |
| 6-8.CT.a.1 | Describe how data is abstracted by listing attributes of everyday items to represent, order and compare those items (e.g., street address as an abstraction for locations; car make, model, and license plate number as an abstraction for cars). | 1 |
| 6-8.CT.a.2 | Define a simple function that represents a more complex task/problem and can be reused to solve similar tasks/problems. | 4 |
| 6-8.CT.b.1 | Design solutions that use repetition and conditionals. | 2 |
| 6-8.CT.b.3 | Individually and collaboratively decompose a problem and create a sub-solution for each of its parts (e.g., video game, robot obstacle course, making dinner). | 10 |
| 6-8.CT.b.4 | Recognize that more than one algorithm can solve a given problem. | 3 |
| 6-8.CT.d.1 | Individually and collaboratively compare algorithms to solve a problem, based on a given criteria (e.g., time, resource, accessibility). | 2, 6 |
| 6-8.CT.d.3 | Create a program, individually and collaboratively, that implements an algorithm to achieve a given goal. | 5 |
| 6-8.CT.d.4 | Implement problem solutions using a programming language, including all of the following: looping behavior, conditional statements, expressions, variables, and functions. | 5 |
| 6-8.CT.d.6 | Use an iterative approach in development and debugging to understand the dimensions of a problem clearly. | 7 |
| 6-8.CT.e.2 | Use and modify simulations to analyze and illustrate a concept in depth (e.g., light rays/mechanical waves interaction with materials, genetic variation). | 8 |
| 6-8.CT.e.3 | Select and use computer simulations, individually and collaboratively, to gather, view, analyze, and report results for content-related problems (e.g., migration, trade, cellular function). | 8 |

## Grade 8: Build the Defence

Design and test defences. Write whole functions and test them.

| # | Lesson | Question of the day | Students can say | Code | Career | Standards |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Rules of the Job | What makes testing a system legal and fair? | I can check whether a target is inside a signed agreement, and report a flaw the right way. | 2 of 4 | Penetration tester | 6-8.CAS.b.8, 6-8.CAS.b.6, 6-8.CAS.c.2 |
| 2 | Build a Safe Sign-In | How can a site check your password without keeping it? | I can build a sign-in that stores scrambled, salted passwords and locks after wrong tries. | 4 of 4 | Identity engineer | 6-8.CAS.a.1, 6-8.CT.d.4 |
| 3 | Never Trust Input | Why should a program check everything a person types? | I can find a flaw caused by unchecked input and fix it with length and character checks. | 4 of 4 | Application security engineer | 6-8.CAS.a.1, 6-8.CT.b.5 |
| 4 | Who Is Allowed? | Signing in proves who you are. What decides what you may see? | I can write a permission check so each person sees only the records they are allowed to see. | 3 of 4 | Privacy engineer | 6-8.CAS.a.1, 6-8.CAS.a.3, 6-8.CT.b.2 |
| 5 | Lock Down the Snack Shop **(project)** | How do you make code safe when you did not write it? | I can find flaws in code I did not write, fix them, and write checks that prove each fix. | 4 of 5 | Security code reviewer | 6-8.CT.d.6, 6-8.CT.d.3, 6-8.CT.d.5 |
| 6 | Sharing a Key in Public | How can two people agree on a secret while someone listens to every word? | I can explain and code how two people make a shared secret key over a public network. | 3 of 5 | Cryptographer | 6-8.CS.c.3, 6-8.CAS.a.1 |
| 7 | Has It Been Changed? | How can you tell that a file is exactly the same as the one that was sent? | I can use fingerprints to find a changed file and to check that an update is real. | 3 of 4 | Release engineer | 6-8.CAS.a.1, 6-8.CT.c.2 |
| 8 | Firewall Designer | How does a network decide which traffic to let in? | I can write an ordered list of firewall rules that blocks by default, and test it. | 3 of 4 | Network security engineer | 6-8.CAS.a.1, 6-8.CS.c.2, 6-8.CT.b.5 |
| 9 | Catch It in the Logs | How do defenders notice a break-in that makes no noise? | I can search a log, write alert rules that catch a break-in, and put the response steps in order. | 3 of 4 | Security operations analyst | 6-8.CAS.a.1, 6-8.CT.c.4 |
| 10 | Design and Defend **(project)** | Why does a strong defence need more than one layer? | I can design layered defences as functions, test them against attacks, and write a security plan. | 4 of 5 | Security architect | 6-8.CAS.a.1, 6-8.CT.b.3, 6-8.CT.d.3 |

| Standard | Text | Lessons |
| --- | --- | --- |
| 6-8.CAS.a.1 | Identify threats and actively protect devices and networks from viruses, intrusion, vandalism, and other malicious activities. | 2, 3, 4, 6, 7, 8, 9, 10 |
| 6-8.CAS.a.3 | Explain the connection between the persistence of data on the Internet, personal online identity, and personal privacy. | 4 |
| 6-8.CAS.b.6 | Demonstrate compliance with the school’s Acceptable Use Policy [AUP]. | 1 |
| 6-8.CAS.b.8 | Explain positive and malicious purposes of hacking. | 1 |
| 6-8.CAS.c.2 | Identify and discuss the technology proficiencies needed in the classroom and the workplace, and how to meet the needs. | 1 |
| 6-8.CS.c.2 | Model the components of a network, including devices, routers, switches, cables, wires, and transponders. | 8 |
| 6-8.CS.c.3 | Describe how information, both text and non-text, is translated and communicated between digital devices over a computer network. | 6 |
| 6-8.CT.b.2 | Use logical reasoning to predict outputs given varying inputs. | 4 |
| 6-8.CT.b.3 | Individually and collaboratively decompose a problem and create a sub-solution for each of its parts (e.g., video game, robot obstacle course, making dinner). | 10 |
| 6-8.CT.b.5 | Recognize that boundaries need to be taken into account for an algorithm to produce correct results. | 3, 8 |
| 6-8.CT.c.2 | Describe how computers store, manipulate, and transfer data types and files (e.g., integers, real numbers, Boolean Operators) in a binary system. | 7 |
| 6-8.CT.c.4 | Perform a variety of operations such as sorting, filtering, and searching in a database to organize and display information in a variety of ways such as number formats (scientific notation and percentages), charts, tables, and graphs. | 9 |
| 6-8.CT.d.3 | Create a program, individually and collaboratively, that implements an algorithm to achieve a given goal. | 5, 10 |
| 6-8.CT.d.4 | Implement problem solutions using a programming language, including all of the following: looping behavior, conditional statements, expressions, variables, and functions. | 2 |
| 6-8.CT.d.5 | Trace programs step-by-step in order to predict their behavior. | 5 |
| 6-8.CT.d.6 | Use an iterative approach in development and debugging to understand the dimensions of a problem clearly. | 5 |
