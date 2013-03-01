// known issues //
- background doesn't freeze during question on androids
- crash image doesn't show on iphones
- when entering name, user can scroll down to see moving road
- screen rotation breaks game
- every button with event listener get event binding stacked up every time you restart
- long names break highscore formatting

// to-do //
- run into question right after boost?
- prevent default highlighting on start & end menu
- increase score faster when in boost
- don't hide objects during question
- pause game button


=======================


user test:

Ying~U01:
 	- tries to swipe to switch lanes
 	- always has finger directly over car when playing
 	- accidentally answers question because finger is on screen to navigate
 		- suggests a confirm button for answering
 	- can't figure out what powerups do
 	- thinks some power-ups aren't useful
 		- suggests changing eliminate to second chance when answer wrong (<- great idea!)
 	- got frustrated when answering question during boost makes boost go away
 	- suggestion: show question for a few seconds (without countdown) before showing options
 	- feels game is too easy (obviously), gets repetitive, skill-based gaming should get harder (objects move faster, etc) and ideally independent of english-based gaming
 	- wants option to mute bgm music / se separately
 	- wants pause button


=======================


// fixed issues //
- obstacles & scoring sometimes continue moving when answering question
- game continues after displaying game over screen (may be same issue as above)
- after answering once, can still answer while waiting for question to disappear
- gas meter doesn't start at full (visually)
- width of coins too narrow
- on phones, feedback highlight is too strong
- on phones, right answer gains too much gas (may be same issue as above)
- on phones, can click on crossed-out answer
- when restarting, obstacles are still there
- speed of road & obstacles not really matching
- instructions & high score


// finished to-do //
- music
- update img assets - obstacles, coin
- decrease gas when hitting obstacle
- talk about background behavior when answering question
- change fire sprite for boost
- change obstacles to cars
- make obstacles unhittable & semi-transparent when in boost
- change spawn rate of powerups, obstacles, coins, etc.
- stop gas from decreasing when in boost?
- obstacle & powerups shouldn't overlap
- show # of right vs wrong
- coin should add to score
- score increase when answer question right
- mocks for tutorial
- asset manager
- canvas buffering



=====================



// asset credits //

grass texture: Patrick Hoesly

music: garageband
sound effects: various people from freesound.org