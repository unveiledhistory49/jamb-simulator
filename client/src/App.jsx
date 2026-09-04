import React, { useState, useEffect, useRef, useCallback } from 'react';
import HomeDashboard from './components/HomeDashboard';
import CbtHeader from './components/CbtHeader';
import SubjectTabs from './components/SubjectTabs';
import QuestionCard from './components/QuestionCard';
import QuestionPalette from './components/QuestionPalette';
import SubmitModal from './components/SubmitModal';
import ResultDashboard from './components/ResultDashboard';
import JambCalculator from './components/JambCalculator';
import AuthModal from './components/AuthModal';
import UserLearningDashboard from './components/UserLearningDashboard';
import { Loader2, AlertCircle } from 'lucide-react';
import { generateLocalExam, submitLocalExam } from './utils/localExamEngine';
import { getStoredUser, logoutUser, saveExamToCloud, saveMistakesToCloud } from './utils/supabaseClient';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'exam' | 'result' | 'learning'
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // User Auth state (accessible publicly, auth required on exam launch)
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Exam state
  const [examData, setExamData] = useState(null);
  const [activeSubject, setActiveSubject] = useState('english');
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(7200);
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionTimeSpent, setQuestionTimeSpent] = useState({});

  // UI state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [fontSize, setFontSize] = useState('base');
  const [resultData, setResultData] = useState(null);

  // Filter questions for active subject
  const allQuestions = examData?.questions || [];
  const subjects = examData?.subjects || [];
  const subjectQuestions = allQuestions.filter(q => q.subject_id === activeSubject);
  const currentQuestion = subjectQuestions[subjectIndex];
  
  // Track active question ID for smooth non-interrupted per-question timing
  const currentQuestionIdRef = useRef(null);
  currentQuestionIdRef.current = currentQuestion?.id;

  // Global question number across entire paper
  const globalQuestionNumber = allQuestions.findIndex(q => q.id === currentQuestion?.id) + 1;

  // 1. Continuous Timer Effect (Tracks global countdown and active question duration)
  useEffect(() => {
    let timerId;
    if (view === 'exam' && timeRemaining > 0) {
      timerId = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);

        // Accumulate active view seconds for the currently focused question
        if (currentQuestionIdRef.current) {
          setQuestionTimeSpent(prev => ({
            ...prev,
            [currentQuestionIdRef.current]: (prev[currentQuestionIdRef.current] || 0) + 1
          }));
        }
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [view, timeRemaining]);

  // 2. Auto Submit on Time Expiry
  const handleAutoSubmit = useCallback(() => {
    handleFinalSubmit();
  }, [examData, answers, timeSpent, questionTimeSpent, currentUser]);

  // 3. Start Exam Function (with seamless Vercel offline fallback)
  const startExam = async (url, fallbackOptions = { mode: 'full_mock' }) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let data;
      try {
        const res = await fetch(url);
        if (res.ok) {
          data = await res.json();
        } else {
          throw new Error('API unavailable, switching to local engine');
        }
      } catch (fetchErr) {
        console.warn("Backend API call failed, generating via local engine:", fetchErr);
        data = await generateLocalExam(fallbackOptions);
      }
      
      setExamData(data);
      setTimeRemaining(data.duration_seconds || 7200);
      setTimeSpent(0);
      setQuestionTimeSpent({});
      setAnswers({});
      setFlagged({});
      setActiveSubject(data.subjects[0]?.id || 'english');
      setSubjectIndex(0);
      setView('exam');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error initializing exam');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExamDirect = (directExamData) => {
    setExamData(directExamData);
    setTimeRemaining(directExamData.duration_seconds || 3600);
    setTimeSpent(0);
    setAnswers({});
    setFlagged({});
    setActiveSubject(directExamData.subjects[0]?.id || 'mistakes');
    setSubjectIndex(0);
    setView('exam');
    window.scrollTo(0, 0);
  };

  // Auth gate wrapper
  const handleRequireAuth = (action) => {
    setPendingAction(() => action);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      act();
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setView('home');
  };

  const handleStartFullMock = ({ includePassages = true, includeNovel = true } = {}) => {
    startExam(
      `/api/exam/generate?mode=full_mock&include_passages=${includePassages}&include_novel=${includeNovel}`,
      { mode: 'full_mock', includePassages, includeNovel }
    );
  };

  const handleStartSubjectDrill = (subject, count, year, { includePassages = true, includeNovel = true } = {}) => {
    let url = `/api/exam/generate?mode=subject_drill&subject=${subject}&count=${count}&include_passages=${includePassages}&include_novel=${includeNovel}`;
    if (year) url += `&year=${year}`;
    startExam(url, { mode: 'subject_drill', subject, count, year, includePassages, includeNovel });
  };

  // Option selection
  const handleSelectOption = (optionKey) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionKey
    }));
  };

  const handleClearAnswer = () => {
    if (!currentQuestion) return;
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentQuestion.id];
      return updated;
    });
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlagged(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (subjectIndex < subjectQuestions.length - 1) {
      setSubjectIndex(subjectIndex + 1);
    } else {
      const currSubjIndex = subjects.findIndex(s => s.id === activeSubject);
      if (currSubjIndex < subjects.length - 1) {
        const nextSubj = subjects[currSubjIndex + 1];
        setActiveSubject(nextSubj.id);
        setSubjectIndex(0);
      }
    }
    window.scrollTo({ top: 90, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (subjectIndex > 0) {
      setSubjectIndex(subjectIndex - 1);
    } else {
      const currSubjIndex = subjects.findIndex(s => s.id === activeSubject);
      if (currSubjIndex > 0) {
        const prevSubj = subjects[currSubjIndex - 1];
        const prevSubjQs = allQuestions.filter(q => q.subject_id === prevSubj.id);
        setActiveSubject(prevSubj.id);
        setSubjectIndex(Math.max(0, prevSubjQs.length - 1));
      }
    }
    window.scrollTo({ top: 90, behavior: 'smooth' });
  };

  const handleSelectSubject = (subjId) => {
    setActiveSubject(subjId);
    setSubjectIndex(0);
    window.scrollTo({ top: 90, behavior: 'smooth' });
  };

  // 4. Submit & Grading
  const handleFinalSubmit = async () => {
    if (!examData) return;
    setIsSubmitting(true);
    try {
      let result;
      try {
        const payload = {
          exam_id: examData.exam_id,
          mode: examData.mode,
          time_spent_seconds: timeSpent,
          answers: answers,
          question_ids: allQuestions.map(q => q.id),
          question_time_spent: questionTimeSpent
        };

        const res = await fetch('/api/exam/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          result = await res.json();
        } else {
          throw new Error('API submission failed, scoring locally');
        }
      } catch (submitErr) {
        console.warn("Backend submit failed, evaluating locally:", submitErr);
        result = await submitLocalExam({
          exam_id: examData.exam_id,
          mode: examData.mode,
          time_spent_seconds: timeSpent,
          answers: answers,
          question_ids: allQuestions.map(q => q.id),
          question_time_spent: questionTimeSpent
        });
      }

      setResultData(result);
      setIsSubmitModalOpen(false);
      setView('result');
      window.scrollTo(0, 0);

      // Cloud Sync to Supabase for the active candidate
      const activeUser = currentUser || getStoredUser();
      if (activeUser?.username) {
        saveExamToCloud(result.summary, activeUser.username);
        const wrongQs = result.review.filter(r => !r.is_correct);
        if (wrongQs.length > 0) {
          saveMistakesToCloud(wrongQs.slice(0, 50), activeUser.username);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting exam: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Launch targeted revision drill for weak topics
  const handleStartRevisionDrill = (targetTopics) => {
    startExam('/api/exam/drill?topics=' + encodeURIComponent(targetTopics.join(',')), {
      mode: 'revision_drill',
      target_topics: targetTopics,
      count: 20
    });
  };

  // Launch drill for single specific syllabus topic
  const handleStartSingleTopicDrill = (topicName, subjectId) => {
    startExam('/api/exam/drill?subject=' + encodeURIComponent(subjectId || 'english') + '&topic=' + encodeURIComponent(topicName), {
      mode: 'revision_drill',
      subject: subjectId || 'english',
      target_topics: [topicName],
      count: 15
    });
  };

  // 5. Official JAMB 8-Key Keyboard Navigation
  useEffect(() => {
    if (view !== 'exam') return;

    const handleKeyDown = (e) => {
      if (['input', 'textarea', 'select'].includes(e.target.tagName.toLowerCase())) {
        return;
      }

      const key = e.key.toLowerCase();

      if (['a', 'b', 'c', 'd'].includes(key)) {
        e.preventDefault();
        handleSelectOption(key);
      } else if (key === 'n') {
        e.preventDefault();
        handleNext();
      } else if (key === 'p') {
        e.preventDefault();
        handlePrevious();
      } else if (key === 'r') {
        e.preventDefault();
        handleToggleFlag();
      } else if (key === 's') {
        e.preventDefault();
        setIsSubmitModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, subjectIndex, activeSubject, currentQuestion, subjectQuestions, subjects]);

  const totalAnsweredCount = Object.keys(answers).length;
  const flaggedTotal = Object.values(flagged).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-4">
          <Loader2 className="animate-spin text-emerald-400" size={48} />
          <div className="text-lg font-bold">Compiling Official CBT Examination Paper...</div>
          <div className="text-xs text-slate-400 font-mono">Loading authentic questions & passages</div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-white hover:underline text-xs">Dismiss</button>
        </div>
      )}

      {/* VIEW: PUBLIC HOME DASHBOARD */}
      {view === 'home' && (
        <main className="flex-1">
          <HomeDashboard
            currentUser={currentUser}
            onStartFullMock={handleStartFullMock}
            onStartSubjectDrill={handleStartSubjectDrill}
            onRequireAuth={handleRequireAuth}
            onOpenLearning={() => setView('learning')}
            onLogout={handleLogout}
          />
        </main>
      )}

      {/* VIEW: INDIVIDUAL USER LEARNING DASHBOARD */}
      {view === 'learning' && currentUser && (
        <main className="flex-1">
          <UserLearningDashboard
            user={currentUser}
            onBackToHome={() => setView('home')}
            onStartExamWithQuestions={handleStartExamDirect}
            onStartRevisionDrill={handleStartRevisionDrill}
            onStartSingleTopicDrill={handleStartSingleTopicDrill}
            onLogout={handleLogout}
          />
        </main>
      )}

      {/* VIEW: EXAM CBT SESSION */}
      {view === 'exam' && examData && (
        <div className="flex-1 flex flex-col">
          {/* Official CBT Top Bar */}
          <CbtHeader
            candidateName={currentUser ? `${currentUser.username.toUpperCase()} (Science Candidate)` : "Candidate (Science UTME)"}
            regNumber="2026/UTME/948201"
            timeRemaining={timeRemaining}
            onToggleCalculator={() => setIsCalculatorOpen(!isCalculatorOpen)}
            isCalculatorOpen={isCalculatorOpen}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            examMode={examData.mode}
            totalAnswered={totalAnsweredCount}
            totalQuestions={allQuestions.length}
            flaggedCount={flaggedTotal}
            activeSubjectName={subjects.find(s => s.id === activeSubject)?.name || 'Subject'}
            subjectQuestionIndex={subjectIndex + 1}
            totalInSubject={subjectQuestions.length}
          />

          {/* Subject Switcher Tabs */}
          <SubjectTabs
            subjects={subjects}
            activeSubject={activeSubject}
            onSelectSubject={handleSelectSubject}
            answers={answers}
            allQuestions={allQuestions}
          />

          {/* Main Question Interface */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
            <QuestionCard
              question={currentQuestion}
              questionNumber={globalQuestionNumber}
              subjectQuestionIndex={subjectIndex + 1}
              totalInSubject={subjectQuestions.length}
              userAnswer={currentQuestion ? answers[currentQuestion.id] : null}
              isFlagged={currentQuestion ? Boolean(flagged[currentQuestion.id]) : false}
              onSelectOption={handleSelectOption}
              onClearAnswer={handleClearAnswer}
              onToggleFlag={handleToggleFlag}
              onNext={handleNext}
              onPrevious={handlePrevious}
              hasPrevious={subjectIndex > 0 || subjects.findIndex(s => s.id === activeSubject) > 0}
              hasNext={subjectIndex < subjectQuestions.length - 1 || subjects.findIndex(s => s.id === activeSubject) < subjects.length - 1}
              onSubmitExam={() => setIsSubmitModalOpen(true)}
              fontSize={fontSize}
            />

            {/* Question Palette */}
            <QuestionPalette
              subjectQuestions={subjectQuestions}
              currentIndex={subjectIndex}
              onSelectIndex={(idx) => {
                setSubjectIndex(idx);
                window.scrollTo({ top: 90, behavior: 'smooth' });
              }}
              answers={answers}
              flagged={flagged}
              activeSubjectName={subjects.find(s => s.id === activeSubject)?.name || 'Subject'}
            />
          </main>

          {/* Digital Calculator Modal */}
          <JambCalculator
            isOpen={isCalculatorOpen}
            onClose={() => setIsCalculatorOpen(false)}
          />

          {/* Submit Confirmation Modal */}
          <SubmitModal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            onConfirmSubmit={handleFinalSubmit}
            subjects={subjects}
            allQuestions={allQuestions}
            answers={answers}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* VIEW: RESULTS & PERFORMANCE REVIEW */}
      {view === 'result' && resultData && (
        <main className="flex-1">
          <ResultDashboard
            resultData={resultData}
            onRetakeExam={() => {
              if (examData?.mode === 'full_mock') {
                handleStartFullMock();
              } else {
                startExam(`/api/exam/generate?mode=${examData?.mode || 'subject_drill'}&subject=${activeSubject}`);
              }
            }}
            onGoHome={() => setView('home')}
            currentUser={currentUser}
            onOpenLearning={() => setView('learning')}
            onStartRevisionDrill={handleStartRevisionDrill}
            onStartSingleTopicDrill={handleStartSingleTopicDrill}
          />
        </main>
      )}

      {/* Auth Modal (Prompted when user clicks practice or exam) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-center py-4 text-xs text-slate-500">
        JAMB CBT Simulated Examination Portal • Built for Candidate Success • Free & Open Practice
      </footer>
    </div>
  );
}
