import { useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeftIcon, Sparkles, Camera, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next"; 

// Components
import { Button } from "../components/ui/Button";
import { UploadZone } from "../components/medical/UploadZone";
import { MedicalDisclaimer } from "../components/medical/MedicalDisclaimer";
import { QuestionCard, Question } from "../components/medical/QuestionCard";
import { AnswerSummary } from "../components/medical/AnswerSummary";
import { CameraCapture } from "../components/medical/CameraCapture";
import { useAuth } from "../contexts/AuthContext";
import API from "../Api";

type UploadState = "idle" | "camera" | "uploading" | "analyzing" | "questions" | "summary";

interface AiResult {
  status: "SUCCESS" | "UNCERTAIN";
  diagnosis?: string;
  lesion_type?: string;
  confidence?: number;
  explanation?: string;
  scanId?: string;
  riskLevel?: "low" | "medium" | "high";
  date?: string;
}

const pageVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

export function UploadPage(): JSX.Element {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const { token } = useAuth();

  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const uploadInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/questions");
        const data = await res.json();
        const formatted = data.questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          type: "multiple-choice",
          options: q.options
        }));
        setQuestions(formatted);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();

    return () => {
      if (uploadInterval.current) clearInterval(uploadInterval.current);
    };
  }, []);

  const uploadToServer = useCallback(
    async (selectedFile: File) => {
      if (!token) {
        navigate("/login");
        return;
      }

      setState("analyzing");
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("userAnswers", JSON.stringify(answers));

      try {
        const res = await API.post("/api/v1/scans", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const data: AiResult = res.data?.data;

        if (!data) throw new Error("Analysis failed");

        setTimeout(() => {
          navigate("/results", {
            state: {
              aiResult: data,
              answers
            }
          });
        }, 150);

      } catch (err: any) {
        alert(t("upload.errorAnalysis", "Error analyzing image."));
        setState("idle");
      }
    },
    [answers, navigate, token, t]
  );

  const handleAnswer = useCallback((answer: string) => {
    const currentQuestion = questions[index];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  }, [index, questions]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {

    if (!token) {
      alert(t("upload.errorLogin", "Please login first to analyze images."));
      navigate("/login");
      return;
    }

    setFile(selectedFile);
    setProgress(0);
    setState("uploading");

    uploadInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (uploadInterval.current) clearInterval(uploadInterval.current);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    try {

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("http://127.0.0.1:8000/check-oral-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "NOT_ORAL" || data.status === "UNCERTAIN") {
        alert(data.message || t("upload.errorInvalid", "This image is not valid for oral analysis."));
        setState("idle");
        return;
      }

      setState("questions");

    } catch (err) {
      alert(t("upload.errorValidation", "Error validating image."));
      setState("idle");
    }

  }, [token, navigate, t]);

  const isUploadStage = ["idle", "uploading", "analyzing"].includes(state);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6">
            <ArrowLeftIcon className="w-4 h-4" /> {t("upload.back", "Back")}
          </Button>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> {t("upload.title", "AI Oral Analysis")}
          </h1>
          <p className="text-slate-500 mt-2">{t("upload.subtitle", "Upload or capture an image for clinical screening")}</p>
        </div>

        <AnimatePresence mode="wait">
          {state === "camera" && (
            <CameraCapture
              onCapture={handleFileSelect}
              onClose={() => setState("idle")}
              answers={answers} 
            />
          )}

          {isUploadStage && (
            <motion.div key="upload" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <UploadZone onFileSelect={handleFileSelect} uploadProgress={progress} state={state} />

                {state === "uploading" && (
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                    <div className="bg-teal-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                )}

                {state === "analyzing" && (
                  <div className="text-center py-6">
                    <RefreshCw className="w-8 h-8 mx-auto text-teal-600 animate-spin" />
                    <h3 className="mt-3 text-lg font-semibold text-slate-800">{t("upload.processing", "Processing with AI...")}</h3>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => {
                      if (!token) {
                        alert(t("upload.errorLogin", "Please login to use the camera."));
                        navigate("/login");
                      } else {
                        setState("camera");
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" /> {t("upload.openCamera", "Open Camera")}
                  </Button>
                  {file && (
                    <Button variant="outline" onClick={() => { setFile(null); setState("idle"); }} className="flex-1">
                      {t("upload.reset", "Reset")}
                    </Button>
                  )}
                </div>
              </div>
              <MedicalDisclaimer />
            </motion.div>
          )}

          {state === "questions" && questions.length > 0 && (
            <motion.div key="questions" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <QuestionCard
                question={questions[index]}
                answer={answers[questions[index].id] || ""}
                onAnswer={handleAnswer}
                onNext={() => index < questions.length - 1 ? setIndex(i => i + 1) : setState("summary")}
                onBack={() => index > 0 ? setIndex(i => i - 1) : setState("idle")}
                currentStep={index + 1}
                totalSteps={questions.length}
                isFirst={index === 0}
                isLast={index === questions.length - 1}
              />
            </motion.div>
          )}

          {state === "summary" && (
            <motion.div key="summary" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AnswerSummary
                questions={questions}
                answers={answers}
                onEdit={(i) => { setIndex(i); setState("questions"); }}
                onContinue={() => { if (file) uploadToServer(file); }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}