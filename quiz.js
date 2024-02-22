var originalQuestions = {};
var questions = {};
var currentQuestionIndex = 0;
var currentPartInQuestion = 1;
var correctIndex = 0;
var score = 0;
var fails = 0;
var mode = "";

function loadQuiz(data)
{
	originalQuestions = JSON.parse(data).questions;
}

function randomNumBetween(start, end)
{
	return Math.floor(start + Math.random() * (end - start));
}

function getRandomAnswer()
{
	var randomQuestionIndex = randomNumBetween(0, questions.length);

	var isSinglePart = questions[randomQuestionIndex].parts == 1;
	var partToUse = randomNumBetween(isSinglePart ? 1 : 2, questions[randomQuestionIndex].parts + 1);

	if (currentPartInQuestion == 1) {
		partToUse = 1;
	}

	if (currentPartInQuestion == questions[currentQuestionIndex].parts) {
		partToUse = questions[randomQuestionIndex].parts;
	}

	if (randomQuestionIndex == currentQuestionIndex && partToUse == currentPartInQuestion) {
		randomQuestionIndex = 1;

		if (randomQuestionIndex == currentQuestionIndex) {
			randomQuestionIndex = 2;
		}

		partToUse = 1;
	}

	return "<img src=\"images/" + questions[randomQuestionIndex].id + "-" + partToUse + ".png\">";
}

function loadQuestion()
{
	document.getElementById("question").innerHTML = "<img src=\"images/q" + questions[currentQuestionIndex].id + ".png\">";
	options = ["first", "second", "third", "fourth"];
	correctIndex = randomNumBetween(0, options.length);

	for (var i = 0; i < options.length; i++) {
		if (i === correctIndex) {
			document.getElementById(options[i]).innerHTML = "<img src=\"images/" + questions[currentQuestionIndex].id + "-" + currentPartInQuestion + ".png\">";
		} else {
			document.getElementById(options[i]).innerHTML = getRandomAnswer();
		}
	}
}

function practice()
{
	score = 0;
	fails = 0;

	questions = originalQuestions;

	selectRandomQuestion();
	renderScoreAndFails();
	loadQuestion();
}

function renderScoreAndFails()
{
	document.getElementById("score").innerHTML = "" + score;
	document.getElementById("fails").innerHTML = "" + fails;
	document.getElementById("tot").innerHTML = "" + (questions[currentQuestionIndex] ? questions[currentQuestionIndex].parts : "2");
	document.getElementById("rem").innerHTML = "" + currentPartInQuestion;
}

function selectRandomQuestion()
{
	if (location.search.startsWith("?")) {
		currentQuestionIndex = parseInt(location.search.split("?")[1]) - 1;
		return;
	}

	currentQuestionIndex = randomNumBetween(0, questions.length);
}

function answer(selectedIndex)
{
	var isCorrect = selectedIndex === correctIndex;

	document.getElementById("splash").style.visibility = "visible";
	document.getElementById("splash").style.opacity = "0.9";

	if (isCorrect) {
		if (currentPartInQuestion < questions[currentQuestionIndex].parts) {
			currentPartInQuestion++;
		} else {
			selectRandomQuestion();
			currentPartInQuestion = 1;
			score += 1;
		}

		loadQuestion();
		document.getElementById("splash").style.backgroundColor = "green";
		document.getElementById("splash").innerHTML = "Correct! 🙂";
	}
	else {
		fails += 1;
		document.getElementById("splash").style.backgroundColor = "red";
		document.getElementById("splash").innerHTML = "Incorrect 😭";
	}

	renderScoreAndFails();

	setTimeout(function () {
		document.getElementById("splash").style.opacity = "0";
		document.getElementById("splash").style.visibility = "hidden";
	}, isCorrect ? 200 : 1000);
}

window.onload = function ()
{
	var req = new XMLHttpRequest();
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			loadQuiz(req.responseText);
			practice();
		}
	};

	req.open("GET", "calculus_questions.json");
	req.send();
};
