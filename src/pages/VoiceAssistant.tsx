import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX, ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("hi");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const detectedLangRef = useRef<string>("");

  const bcp47Map: Record<string, string> = {
    hi: "hi-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN", mr: "mr-IN", gu: "gu-IN",
    kn: "kn-IN", ml: "ml-IN", pa: "pa-IN", or: "or-IN", as: "as-IN", ur: "ur-IN",
    en: "en-US",
  };

  const getVoiceForLang = (langCode: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    
    // Try exact match first
    let voice = voices.find(v => v.lang === langCode);
    if (voice) return voice;
    
    // Try language prefix match
    const langPrefix = langCode.split('-')[0];
    voice = voices.find(v => v.lang.startsWith(langPrefix));
    if (voice) return voice;
    
    // Fallback to English or first available
    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Warm up voices and handle voice loading
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const languages = [
    { code: "hi", name: "हिन्दी (Hindi)", sample: "नमस्ते! मैं आपकी खेती में कैसे मदद कर सकता हूं?" },
    { code: "ta", name: "தமிழ் (Tamil)", sample: "வணக்கம்! உங்கள் விவசாயத்தில் எப்படி உதவ முடியும்?" },
    { code: "te", name: "తెలుగు (Telugu)", sample: "నమస్కారం! మీ వ్యవసాయంలో ఎలా సహాయం చేయగలను?" },
    { code: "bn", name: "বাংলা (Bengali)", sample: "নমস্কার! আপনার কৃষিকাজে আমি কীভাবে সাহায্য করতে পারি?" },
    { code: "mr", name: "मराठी (Marathi)", sample: "नमस्कार! तुमच्या शेतीमध्ये मी कशी मदत करू शकते?" },
    { code: "gu", name: "ગુજરાતી (Gujarati)", sample: "નમસ્તે! તમારા ખેતીમાં હું કેવી રીતે મદદ કરી શકું?" },
    { code: "kn", name: "ಕನ್ನಡ (Kannada)", sample: "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಕೃಷಿಯಲ್ಲಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?" },
    { code: "ml", name: "മലയാളം (Malayalam)", sample: "നമസ്കാരം! നിങ്ങളുടെ കൃഷിയിൽ എനിക്ക് എങ്ങനെ സഹായിക്കാം?" },
    { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)", sample: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡੀ ਖੇਤੀ ਵਿੱਚ ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?" },
    { code: "or", name: "ଓଡ଼ିଆ (Odia)", sample: "ନମସ୍କାର! ଆପଣଙ୍କ କୃଷିରେ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?" },
    { code: "as", name: "অসমীয়া (Assamese)", sample: "নমস্কাৰ! আপোনাৰ কৃষিত মই কেনেকৈ সহায় কৰিব পাৰোঁ?" },
    { code: "ur", name: "اردو (Urdu)", sample: "السلام علیکم! میں آپ کی کھیتی میں کیسے مدد کر سکتا ہوں؟" }
  ];

  const sampleQuestions = [
    "मेरी फसल में कीड़े लगे हैं, क्या करूं?",
    "गेहूं की बुवाई का सही समय क्या है?",
    "धान के लिए कितना पानी चाहिए?",
    "मेरे टमाटर के पत्ते पीले हो रहे हैं",
    "खाद की कमी के लक्षण क्या हैं?",
    "बारिश के बाद फसल की देखभाल कैसे करें?",
    "नई तकनीक से खेती कैसे करें?",
    "मंडी में सबसे अच्छी कीमत कैसे पाएं?"
  ];

  const aiResponses = [
    "आपकी फसल में कीड़ों की समस्या के लिए पहले प्राकृतिक उपाय करें। नीम का तेल या गौमूत्र का छिड़काव करें। यदि समस्या बनी रहे तो स्थानीय कृषि विशेषज्ञ से सलाह लें।",
    "गेहूं की बुवाई का सबसे अच्छा समय नवंबर से दिसंबर के बीच है। मिट्टी का तापमान 15-20 डिग्री सेल्सियस होना चाहिए। बुवाई से पहले खेत की अच्छी जुताई करें।",
    "धान के लिए प्रति हेक्टेयर 1000-1200 मिमी पानी की आवश्यकता होती है। रोपाई के बाद 2-3 सेमी पानी बनाए रखें। फूल आने के समय पानी की कमी न होने दें।",
    "टमाटर के पत्ते पीले होने का मतलब पोषक तत्वों की कमी हो सकती है। नाइट्रोजन की कमी हो सकती है। खाद डालें और पानी की मात्रा ठीक रखें।",
    "खाद की कमी के लक्षण में पत्तों का पीला होना, विकास रुकना, और फलों का छोटा होना शामिल है। मिट्टी की जांच कराएं और उसके अनुसार खाद डालें।",
    "बारिश के बाद पानी का निकास सुनिश्चित करें। खेत में पानी न रुकने दें। फंगस से बचाव के लिए दवाई का छिड़काव करें और मिट्टी की जांच करें।",
    "नई तकनीक में ड्रिप सिंचाई, मल्चिंग, और सटीक कृषि शामिल है। जैविक खाद का उपयोग करें। मौसम आधारित सलाह लें और डिजिटल टूल्स का उपयोग करें।",
    "बेहतर कीमत के लिए मंडी जाने से पहले कीमतों की जांच करें। गुणवत्ता बनाए रखें। सही समय पर बेचें और अगर संभव हो तो सीधे खरीदारों से संपर्क करें।"
  ];

  // Enhanced Speech Recognition with better detection
  const startListening = () => {
    if (isListening) return;
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      toast.error("Voice not supported. Use Chrome browser.");
      return;
    }
    setTranscript("");
    setResponse("");

    const recog = new SR();
    recognitionRef.current = recog;
    
    // Enhanced recognition settings
    recog.lang = bcp47Map[currentLanguage] || "hi-IN";
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 3;
    
    setIsListening(true);
    toast.success(`Listening in ${languages.find(l => l.code === currentLanguage)?.name}...`);

    let finalText = "";
    let silenceTimer: any;

    recog.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += chunk + " ";
        } else {
          interim += chunk;
        }
      }
      const currentText = (finalText + interim).trim();
      setTranscript(currentText);
      
      // Auto-stop after 2 seconds of silence
      clearTimeout(silenceTimer);
      if (currentText) {
        silenceTimer = setTimeout(() => {
          if (recog && isListening) {
            recog.stop();
          }
        }, 2000);
      }
    };

    recog.onerror = (e: any) => {
      console.log('Speech error:', e.error);
      if (e.error === 'no-speech') {
        toast.info("No speech detected. Try speaking louder.");
      } else if (e.error === 'network') {
        toast.error("Network error. Check connection.");
      }
      setIsListening(false);
    };

    recog.onend = async () => {
      setIsListening(false);
      clearTimeout(silenceTimer);
      const text = finalText.trim() || transcript.trim();
      if (text && text.length > 2) {
        await processVoiceInput(text);
      } else {
        toast.info("Please speak clearly and try again");
      }
    };

    try { 
      recog.start(); 
    } catch (error) {
      console.error('Recognition start error:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
    toast.info("Voice listening stopped");
  };

  const processVoiceInput = async (input: string) => {
    setIsProcessing(true);
    try {
      console.log('Processing voice input:', input);
      
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          query: input.trim(),
          section: "Agricultural Voice Assistant",
          targetLang: bcp47Map[currentLanguage] || 'hi-IN',
          userLocale: bcp47Map[currentLanguage] || 'hi-IN',
          context: {
            mode: "voice_assistant",
            language: currentLanguage,
            agricultural_context: true,
            farmer_query: true,
            require_specific_answer: true
          }
        },
      });
      
      console.log('Raw AI Response:', data);
      
      if (error) {
        console.error('AI Error:', error);
        throw error;
      }

      // Verify response is from Gemini AI
      if (!data?.source || data.source !== 'gemini-ai') {
        console.error('Response not from Gemini AI:', data);
        throw new Error('Invalid AI source');
      }

      let answer = data?.answer || "";
      const detectedLang = data?.language || bcp47Map[currentLanguage];
      const timestamp = data?.timestamp;
      const model = data?.model;

      console.log('Verified Gemini Response:', { answer, timestamp, model, source: data.source });

      // Clean up the response
      answer = answer.replace(/^["']|["']$/g, '').trim();
      
      if (answer && answer.length > 5) {
        setResponse(`${answer} [AI: ${new Date(timestamp).toLocaleTimeString()}]`);
        detectedLangRef.current = detectedLang;
        
        // Delay speech slightly to ensure UI updates
        setTimeout(() => {
          speakResponse(answer, detectedLang);
        }, 500);
        
        toast.success(`Gemini AI Response (${model})`);
      } else {
        throw new Error("Empty or invalid response");
      }
    } catch (e: any) {
      console.error('Voice processing error:', e);
      
      const errorMessage = e.message || 'Unknown error';
      console.log('AI Error Details:', errorMessage);
      
      if (errorMessage.includes('Invalid AI source') || errorMessage.includes('Invalid AI response')) {
        toast.error("AI response validation failed. Please try again.");
      } else {
        toast.error("Gemini AI temporarily unavailable. Please try again.");
      }
      
      setResponse(`[ERROR] Gemini AI unavailable: ${errorMessage}. Please try again.`);
      console.log('No fallback - encouraging retry for real AI response');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string, langOverride?: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      // Wait for voices to load
      const speak = () => {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        const lang = langOverride || bcp47Map[currentLanguage] || 'hi-IN';
        utterance.lang = lang;
        
        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || 
                     voices.find(v => v.lang.startsWith('en')) ||
                     voices[0];
        
        if (voice) utterance.voice = voice;
        
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => console.log('Speech started');
        utterance.onend = () => {
          setIsSpeaking(false);
          console.log('Speech ended');
        };
        utterance.onerror = (e) => {
          setIsSpeaking(false);
          console.error('Speech error:', e);
          toast.error('Voice playback failed');
        };
        
        speechSynthesis.speak(utterance);
        toast.success('Playing response');
      };
      
      // Ensure voices are loaded
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          speechSynthesis.onvoiceschanged = null;
          speak();
        };
      } else {
        speak();
      }
    } else {
      toast.error('Voice not supported in this browser');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.info("Audio stopped");
    }
  };

  const askSampleQuestion = (question: string) => {
    setTranscript(question);
    processVoiceInput(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-info/5">
      <SEO
        title="Voice Assistant | Smart Bharat"
        description="Multilingual AI farm assistant powered by Gemini. Speak or type and get precise answers."
      />
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Mic className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">Voice Assistant</h1>
              </div>
            </div>
            <Badge variant="secondary">
              AI-Powered • Multi-Language
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Language Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Language Selection
            </CardTitle>
            <CardDescription>
              Choose your preferred language for voice interaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                <strong>Sample:</strong> {languages.find(l => l.code === currentLanguage)?.sample}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Voice Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Interface</CardTitle>
              <CardDescription>
                Click the microphone to start voice interaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Controls */}
              <div className="flex justify-center space-x-4">
                <Button
                  size="lg"
                  onClick={isListening ? stopListening : startListening}
                  className={`relative ${isListening ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop Listening
                      <div className="absolute -inset-1 bg-red-500 rounded-full animate-pulse opacity-75" />
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Listening
                    </>
                  )}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={isSpeaking ? stopSpeaking : () => speakResponse(response || "Test voice working")}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-5 h-5 mr-2" />
                      Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 mr-2" />
                      {response ? 'Play Audio' : 'Test Voice'}
                    </>
                  )}
                </Button>
              </div>

              {/* Status Indicators */}
              <div className="space-y-2">
                {isListening && (
                  <div className="flex items-center justify-center space-x-2 text-destructive">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm">Listening...</span>
                  </div>
                )}
                
                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2 text-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing...</span>
                  </div>
                )}
                
                {isSpeaking && (
                  <div className="flex items-center justify-center space-x-2 text-success">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">Speaking...</span>
                  </div>
                )}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Your Question:</h4>
                  <p className="text-sm">{transcript}</p>
                </div>
              )}

              {/* Response */}
              {response && (
                <div className="p-4 bg-success/10 rounded-lg">
                  <h4 className="font-semibold text-success mb-2">AI Response:</h4>
                  <p className="text-sm">{response}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sample Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Questions</CardTitle>
              <CardDescription>
                Click on any question to try voice interaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3 hover:bg-primary/10"
                    onClick={() => askSampleQuestion(question)}
                  >
                    <div className="text-sm">{question}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Multi-Language Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Support for 12+ regional languages including Hindi, Tamil, Telugu, Bengali, and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI-Powered Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced AI provides accurate agricultural advice based on your queries.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Offline Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Basic voice functionality works offline for remote areas with limited connectivity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;