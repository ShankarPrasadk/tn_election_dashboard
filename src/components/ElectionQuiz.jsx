import { useState } from 'react';
import { Trophy, ChevronRight, RotateCcw } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'Which party won the most seats in the 2021 TN Assembly election?',
    options: ['DMK', 'AIADMK', 'BJP', 'Congress'],
    correct: 0,
    fact: 'DMK won 133 out of 234 seats in 2021, forming the government under M.K. Stalin.',
  },
  {
    q: 'How many Assembly constituencies does Tamil Nadu have?',
    options: ['200', '224', '234', '244'],
    correct: 2,
    fact: 'Tamil Nadu has 234 Assembly constituencies, last delimited in 2008.',
  },
  {
    q: 'Who was the first Chief Minister of Tamil Nadu (then Madras State)?',
    options: ['C. Rajagopalachari', 'K. Kamaraj', 'C.N. Annadurai', 'P.S. Kumaraswamy Raja'],
    correct: 3,
    fact: 'P.S. Kumaraswamy Raja served as the first CM of Madras State from 1952.',
  },
  {
    q: 'In which year did the DMK first come to power in Tamil Nadu?',
    options: ['1957', '1962', '1967', '1971'],
    correct: 2,
    fact: 'C.N. Annadurai led DMK to power in 1967, ending Congress dominance in TN.',
  },
  {
    q: 'What is the minimum age to contest in Indian state Assembly elections?',
    options: ['18 years', '21 years', '25 years', '30 years'],
    correct: 2,
    fact: 'Per Article 173 of the Indian Constitution, a person must be at least 25 years old.',
  },
  {
    q: 'Which TN constituency has the highest number of voters (as of 2021)?',
    options: ['Sholinganallur', 'Villivakkam', 'Tambaram', 'Alandur'],
    correct: 0,
    fact: 'Sholinganallur had over 5.7 lakh registered voters in the 2021 election.',
  },
  {
    q: 'How many times has AIADMK won the TN Assembly election since 1977?',
    options: ['3 times', '4 times', '5 times', '6 times'],
    correct: 2,
    fact: 'AIADMK won in 1977, 1980 (MGR-led), 1991, 2001, and 2011 (Jayalalithaa-led).',
  },
  {
    q: 'What does the "Rising Sun" symbol represent in TN politics?',
    options: ['AIADMK', 'DMK', 'PMK', 'MDMK'],
    correct: 1,
    fact: 'The Rising Sun (Udaya Suriyam) has been DMK\'s election symbol since its founding.',
  },
  {
    q: 'Who holds the record for being CM of Tamil Nadu the most number of times?',
    options: ['M. Karunanidhi', 'J. Jayalalithaa', 'M.G. Ramachandran', 'C.N. Annadurai'],
    correct: 0,
    fact: 'M. Karunanidhi served as Chief Minister 5 times (1969, 1971, 1989, 1996, 2006).',
  },
  {
    q: 'What percentage voter turnout did TN see in the 2021 Assembly election?',
    options: ['62%', '68%', '72%', '75%'],
    correct: 2,
    fact: 'The 2021 TN Assembly election recorded approximately 72.78% voter turnout.',
  },
];

function shuffleQuestions() {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export default function ElectionQuiz() {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const startQuiz = () => {
    setQuestions(shuffleQuestions());
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setStarted(true);
  };

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[current].correct) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (!started) {
    return (
      <div className="bg-gradient-to-br from-violet-500/10 to-amber-500/5 border border-violet-500/20 rounded-xl p-6 text-center">
        <Trophy size={32} className="text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">TN Election Quiz</h3>
        <p className="text-xs text-slate-400 mb-4">Test your knowledge about Tamil Nadu elections!</p>
        <button
          onClick={startQuiz}
          className="px-6 py-2.5 bg-amber-400 text-slate-900 rounded-lg text-sm font-semibold hover:bg-amber-300 transition-colors"
        >
          Start Quiz (5 Questions)
        </button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👏' : pct >= 40 ? '📚' : '💪';
    const msg = pct >= 80 ? 'Election Expert!' : pct >= 60 ? 'Well Informed!' : pct >= 40 ? 'Keep Learning!' : 'Good Start!';

    return (
      <div className="bg-gradient-to-br from-violet-500/10 to-amber-500/5 border border-violet-500/20 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">{emoji}</div>
        <h3 className="text-xl font-bold text-white mb-1">{msg}</h3>
        <p className="text-sm text-slate-300 mb-1">
          You scored <span className="text-amber-400 font-bold">{score}/{questions.length}</span>
        </p>
        <p className="text-xs text-slate-500 mb-4">
          {pct}% correct · Share your score with friends!
        </p>
        <button
          onClick={startQuiz}
          className="inline-flex items-center gap-2 px-5 py-2 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-lg text-sm font-medium hover:bg-amber-400/20 transition-colors"
        >
          <RotateCcw size={14} /> Play Again
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-amber-500/5 border border-violet-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-500">Question {current + 1}/{questions.length}</span>
        <span className="text-xs text-amber-400 font-medium">Score: {score}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-700/50 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h4 className="text-sm font-medium text-white mb-4">{q.q}</h4>

      <div className="space-y-2 mb-4">
        {q.options.map((opt, idx) => {
          let style = 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:border-slate-600';
          if (answered) {
            if (idx === q.correct) {
              style = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
            } else if (idx === selected && idx !== q.correct) {
              style = 'border-red-500/50 bg-red-500/10 text-red-400';
            } else {
              style = 'border-slate-700/30 bg-slate-800/20 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={answered}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3">
            <span className="text-amber-400 font-medium">Did you know?</span> {q.fact}
          </p>
          <button
            onClick={nextQuestion}
            className="w-full flex items-center justify-center gap-2 py-2 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-lg text-sm font-medium hover:bg-amber-400/20 transition-colors"
          >
            {current + 1 >= questions.length ? 'See Results' : 'Next Question'} <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
