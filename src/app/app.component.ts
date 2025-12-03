import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

// --- Interfaces and Data Structures ---

/** Defines the structure for a single quiz question. */
interface Question {
  text: string;
  options: string[];
  correctAnswerIndex: number; // Index of the correct option in the options array
  explanation: string;
}

// --- Hardcoded Quiz Data: Riddle-Style Questions ---
const QUIZ_QUESTIONS: Question[] = [
  {
    text: "What am I? I have cities, but no houses. I have mountains, but no trees. I have water, but no fish.",
    options: ["A mirror", "A map", "A globe", "A desert"],
    correctAnswerIndex: 1,
    explanation: "A map is a flat representation of geography, containing names for cities, mountains, and oceans, but none of the real objects.",
  },
  {
    text: "Who am I? I speak without a mouth and hear without ears. I have no body, but I come alive with wind.",
    options: ["A robot", "An echo", "A spirit", "A whisper"],
    correctAnswerIndex: 1,
    explanation: "An echo repeats sound (speaks and hears) but is a phenomenon, not a physical being.",
  },
  {
    text: "What am I? I am always hungry, I must always be fed. The finger I lick will soon turn red.",
    options: ["A pet dog", "A fire", "A volcano", "A cloud"],
    correctAnswerIndex: 1,
    explanation: "Fire consumes fuel ('must always be fed') and can cause burns ('turn red').",
  },
  {
    text: "What am I? What has an eye but cannot see?",
    options: ["A hurricane", "A needle", "A camera lens", "A potato"],
    correctAnswerIndex: 1,
    explanation: "The small hole used to thread string through a sewing implement is called the 'eye' of the needle.",
  }
];

// --- Angular Component ---

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 flex items-center justify-center font-sans">
      <div class="w-full max-w-2xl bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/20 relative overflow-hidden">
        
        <!-- Decorative background elements -->
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>

        <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 text-center mb-8 tracking-tight">
          Riddle Master
        </h1>

        <!-- Start Screen -->
        @if (currentQuestionIndex() === -1) {
          <div class="text-center py-8 animate-fade-in">
            <p class="text-xl text-gray-600 mb-10 leading-relaxed">
              Challenge your mind with <span class="font-bold text-indigo-600">{{ questions().length }}</span> mind-bending riddles.
              <br>Are you ready to test your wit?
            </p>
            <button
              (click)="startQuiz()"
              class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
            >
              Start Adventure
              <svg class="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </button>
          </div>
        }

        <!-- Quiz Questions -->
        @if (currentQuestionIndex() !== -1 && !isQuizFinished()) {
          <div class="space-y-8 animate-slide-up">
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
               <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                    [style.width.%]="((currentQuestionIndex() + 1) / questions().length) * 100">
               </div>
            </div>
            
            <div class="flex justify-between items-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
               <span>Question {{ currentQuestionIndex() + 1 }}</span>
               <span>{{ questions().length - currentQuestionIndex() - 1 }} remaining</span>
            </div>

            <!-- Question Card -->
            <div class="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
              <p class="text-2xl font-bold text-gray-800 leading-snug">{{ currentQuestion()!.text }}</p>
            </div>

            <!-- Options -->
            <div class="grid gap-4">
              @for (option of currentQuestion()!.options; track $index) {
                <button
                  (click)="selectAnswer($index)"
                  [class]="getOptionClasses($index)"
                  [disabled]="userAnswers()[currentQuestionIndex()] !== null"
                >
                  <span>{{ option }}</span>
                  @if (userAnswers()[currentQuestionIndex()] !== null) {
                     @if ($index === currentQuestion()!.correctAnswerIndex) {
                        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                     } @else if ($index === userAnswers()[currentQuestionIndex()]) {
                        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     }
                  }
                </button>
              }
            </div>

            <!-- Navigation -->
            @if (userAnswers()[currentQuestionIndex()] !== null) {
              <div class="pt-6 flex justify-end animate-fade-in">
                <button
                  (click)="nextQuestion()"
                  class="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {{ currentQuestionIndex() === questions().length - 1 ? 'Finish Quiz' : 'Next Question' }}
                  <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            }
          </div>
        }

        <!-- Results Screen -->
        @if (isQuizFinished()) {
          <div class="text-center py-8 animate-fade-in">
            <div class="inline-block p-4 rounded-full bg-indigo-50 mb-6">
                <span class="text-6xl">
                    {{ score() >= questions().length / 2 ? '🎉' : '🤔' }}
                </span>
            </div>
            
            <h2 class="text-4xl font-extrabold mb-2 text-gray-900">
              {{ score() >= questions().length / 2 ? 'Outstanding!' : 'Good Effort!' }}
            </h2>
            <p class="text-gray-600 mb-8 text-lg">You scored <span class="font-bold text-indigo-600 text-2xl">{{ score() }}</span> out of {{ questions().length }}</p>

            <!-- Review Section -->
            <div class="text-left mt-8 space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <h3 class="text-lg font-bold text-gray-700 mb-4 sticky top-0 bg-gray-50 pb-2 border-b">Review Answers</h3>
              @for (question of questions(); track $index) {
                <div class="p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-colors" 
                     [class.border-green-200]="userAnswers()[$index] === question.correctAnswerIndex" 
                     [class.border-red-200]="userAnswers()[$index] !== question.correctAnswerIndex">
                  <div class="flex items-start gap-3">
                      <div class="mt-1 min-w-[24px]">
                          @if (userAnswers()[$index] === question.correctAnswerIndex) {
                              <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                          } @else {
                              <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">✕</div>
                          }
                      </div>
                      <div>
                          <p class="font-semibold text-gray-800 text-sm mb-1">{{ question.text }}</p>
                          <p class="text-sm text-gray-600">
                            Your Answer: 
                            <span [class.text-green-600]="userAnswers()[$index] === question.correctAnswerIndex" [class.text-red-600]="userAnswers()[$index] !== question.correctAnswerIndex" class="font-medium">
                              {{ userAnswers()[$index] !== null ? question.options[userAnswers()[$index]!] : 'No Answer' }}
                            </span>
                          </p>
                          @if (userAnswers()[$index] !== question.correctAnswerIndex) {
                            <p class="text-sm text-green-600 font-medium mt-1">
                              Correct: {{ question.options[question.correctAnswerIndex] }}
                            </p>
                          }
                          <p class="text-xs mt-2 text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100 inline-block">💡 {{ question.explanation }}</p>
                      </div>
                  </div>
                </div>
              }
            </div>

            <button
              (click)="restartQuiz()"
              class="mt-10 w-full md:w-auto px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Play Again
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* Custom Scrollbar for review section on results screen */
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #9ca3af; /* gray-400 */
        border-radius: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Store the list of questions
  questions = signal<Question[]>(QUIZ_QUESTIONS);

  // Tracks the current question index. -1 means the quiz hasn't started.
  currentQuestionIndex = signal<number>(-1);

  // Stores the user's selected answer index for each question.
  // null means unanswered. Array size is equal to questions.length.
  userAnswers = signal<(number | null)[]>([]);

  // State to determine if the results should be shown
  isQuizFinished = signal<boolean>(false);

  // --- Computed Properties (Signals) ---

  // Calculates the current question object
  currentQuestion = computed(() => {
    const index = this.currentQuestionIndex();
    const q = this.questions();
    return index >= 0 && index < q.length ? q[index] : null;
  });

  // Calculates the final score
  score = computed(() => {
    const answers = this.userAnswers();
    const q = this.questions();
    let correctCount = 0;
    for (let i = 0; i < q.length; i++) {
      if (answers[i] === q[i].correctAnswerIndex) {
        correctCount++;
      }
    }
    return correctCount;
  });

  // --- Methods ---

  /** Starts the quiz by resetting the state and moving to the first question. */
  startQuiz(): void {
    this.userAnswers.set(Array(this.questions().length).fill(null));
    this.isQuizFinished.set(false);
    this.currentQuestionIndex.set(0);
  }

  /** Selects an answer for the current question. */
  selectAnswer(answerIndex: number): void {
    // Only allow selection if the question hasn't been answered yet
    if (this.userAnswers()[this.currentQuestionIndex()] === null) {
      this.userAnswers.update(answers => {
        const newAnswers = [...answers];
        newAnswers[this.currentQuestionIndex()] = answerIndex;
        return newAnswers;
      });
    }
  }

  /** Moves to the next question or finishes the quiz. */
  nextQuestion(): void {
    const nextIndex = this.currentQuestionIndex() + 1;
    if (nextIndex < this.questions().length) {
      this.currentQuestionIndex.set(nextIndex);
    } else {
      this.isQuizFinished.set(true);
    }
  }

  /** Resets the application state to the start screen. */
  restartQuiz(): void {
    this.currentQuestionIndex.set(-1);
    this.userAnswers.set([]);
    this.isQuizFinished.set(false);
  }

  /** Generates dynamic Tailwind classes for the option buttons. */
  getOptionClasses(optionIndex: number): string {
    const currentQIndex = this.currentQuestionIndex();
    const selectedAnswer = this.userAnswers()[currentQIndex];
    const correctAnswer = this.questions()[currentQIndex].correctAnswerIndex;

    let classes = 'w-full text-left p-5 rounded-xl border-2 transition-all duration-200 text-lg font-medium flex items-center justify-between group ';

    if (selectedAnswer === null) {
      // Unanswered state (Hover/Active)
      classes += 'bg-white border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md cursor-pointer';
    } else {
      // Answered state (Show feedback)
      if (optionIndex === correctAnswer) {
        // Correct answer (Green)
        classes += 'bg-green-50 border-green-500 text-green-700 shadow-md ring-1 ring-green-500';
      } else if (optionIndex === selectedAnswer) {
        // Incorrect selected answer (Red)
        classes += 'bg-red-50 border-red-500 text-red-700 shadow-md';
      } else {
        // Unselected option (Grayed out)
        classes += 'bg-gray-50 border-gray-100 text-gray-400 opacity-50 cursor-not-allowed';
      }
    }
    return classes;
  }
}