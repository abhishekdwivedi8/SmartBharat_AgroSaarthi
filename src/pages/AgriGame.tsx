import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GamepadIcon, 
  Trophy, 
  Coins, 
  Star, 
  Play,
  Award,
  Gift,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AgriGame = () => {
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userTokens, setUserTokens] = useState(2350);

  const games = [
    {
      id: 1,
      title: "Mandi Master",
      description: "Learn about market prices, trading, and mandi operations",
      difficulty: "Beginner",
      tokens: 100,
      duration: "10 min",
      icon: "📊",
      questions: [
        {
          question: "मंडी में सबसे अच्छा भाव कब मिलता है?",
          options: ["सुबह जल्दी", "दोपहर में", "शाम को", "रात में"],
          correct: 0,
          explanation: "सुबह की फसल ताजी होती है और मांग ज्यादा होती है।"
        },
        {
          question: "गेहूं की क्वालिटी कैसे चेक करें?",
          options: ["रंग देखकर", "दाने का साइज", "नमी चेकर से", "सभी तरीकों से"],
          correct: 3,
          explanation: "सभी तरीकों से क्वालिटी चेक करनी चाहिए।"
        }
      ]
    },
    {
      id: 2,
      title: "Crop Doctor",
      description: "Identify diseases and learn treatment methods",
      difficulty: "Intermediate",
      tokens: 150,
      duration: "15 min",
      icon: "🌱",
      questions: [
        {
          question: "गेहूं में पीली पत्ती का क्या कारण है?",
          options: ["कम पानी", "कम खाद", "बीमारी", "सभी संभव"],
          correct: 3,
          explanation: "पीली पत्ती के कई कारण हो सकते हैं।"
        }
      ]
    },
    {
      id: 3,
      title: "Subsidy Scholar",
      description: "Master government schemes and subsidy applications",
      difficulty: "Advanced",
      tokens: 200,
      duration: "20 min",
      icon: "🏛️",
      questions: [
        {
          question: "PM-KISAN योजना में कितनी राशि मिलती है?",
          options: ["₹4000", "₹6000", "₹8000", "₹10000"],
          correct: 1,
          explanation: "PM-KISAN में सालाना ₹6000 मिलते हैं।"
        }
      ]
    }
  ];

  const rewards = [
    { tokens: 500, reward: "5% Discount on Seeds", claimed: true },
    { tokens: 1000, reward: "Free Soil Test Kit", claimed: true },
    { tokens: 2000, reward: "Priority Mandi Entry Pass", claimed: true },
    { tokens: 3000, reward: "₹100 Cash Voucher", claimed: false },
    { tokens: 5000, reward: "Smart Phone Discount 10%", claimed: false }
  ];

  const startGame = (gameId: number) => {
    setSelectedGame(gameId);
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
  };

  const answerQuestion = (answerIndex: number) => {
    const game = games.find(g => g.id === selectedGame);
    if (!game) return;

    const question = game.questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    
    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: "सही जवाब! 🎉",
        description: question.explanation,
      });
    } else {
      toast({
        title: "गलत जवाब 😕",
        description: question.explanation,
        variant: "destructive"
      });
    }

    setTimeout(() => {
      if (currentQuestion + 1 < game.questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Game completed
        const tokensEarned = Math.floor((score + (isCorrect ? 1 : 0)) / game.questions.length * game.tokens);
        setUserTokens(userTokens + tokensEarned);
        toast({
          title: "गेम पूरा! 🏆",
          description: `आपने ${tokensEarned} टोकन जीते हैं!`,
        });
        setGameStarted(false);
        setSelectedGame(null);
      }
    }, 2000);
  };

  const claimReward = (rewardIndex: number) => {
    const reward = rewards[rewardIndex];
    if (userTokens >= reward.tokens && !reward.claimed) {
      setUserTokens(userTokens - reward.tokens);
      rewards[rewardIndex].claimed = true;
      toast({
        title: "रिवॉर्ड मिला! 🎁",
        description: `${reward.reward} आपका है!`,
      });
    }
  };

  if (gameStarted && selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (!game) return null;

    const question = game.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-info/5 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setGameStarted(false);
                setSelectedGame(null);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <Progress value={(currentQuestion / game.questions.length) * 100} className="h-2" />
            </div>
            <Badge>{currentQuestion + 1}/{game.questions.length}</Badge>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{game.title}</CardTitle>
              <CardDescription>Score: {score}/{game.questions.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">{question.question}</h2>
              </div>

              <div className="grid gap-3">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-4 h-auto text-left justify-start"
                    onClick={() => answerQuestion(index)}
                  >
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-info/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Agri Knowledge Game</h1>
                <p className="text-muted-foreground">Learn farming through fun games</p>
              </div>
            </div>
            <Badge className="bg-success/10 text-success border-success/20 text-lg px-4 py-2">
              <Coins className="w-4 h-4 mr-2" />
              {userTokens} Tokens
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Games Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <GamepadIcon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Available Games</h2>
            </div>

            <div className="grid gap-6">
              {games.map((game) => (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{game.icon}</span>
                          <div>
                            <h3 className="text-lg font-bold">{game.title}</h3>
                            <p className="text-muted-foreground">{game.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                          <Badge variant="secondary">{game.difficulty}</Badge>
                          <Badge className="bg-warning/10 text-warning border-warning/20">
                            <Coins className="w-3 h-3 mr-1" />
                            {game.tokens}
                          </Badge>
                          <Badge variant="outline">{game.duration}</Badge>
                        </div>
                      </div>
                      
                      <Button onClick={() => startGame(game.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Play Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Rewards Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-warning" />
              <h2 className="text-xl font-bold">Token Rewards</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Redeem Rewards</CardTitle>
                <CardDescription>Use your tokens for real benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <p className="font-medium">{reward.reward}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Coins className="w-3 h-3 mr-1" />
                          {reward.tokens} tokens
                        </p>
                      </div>
                      
                      {reward.claimed ? (
                        <Badge className="bg-success/10 text-success border-success/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Claimed
                        </Badge>
                      ) : userTokens >= reward.tokens ? (
                        <Button size="sm" onClick={() => claimReward(index)}>
                          <Gift className="w-3 h-3 mr-1" />
                          Claim
                        </Button>
                      ) : (
                        <Badge variant="secondary">Need {reward.tokens - userTokens} more</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Top Players</CardTitle>
                <CardDescription>This week's leaders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "राम कुमार", tokens: 5420, rank: 1 },
                    { name: "श्याम सिंह", tokens: 4890, rank: 2 },
                    { name: "गीता देवी", tokens: 4200, rank: 3 },
                    { name: "You", tokens: userTokens, rank: 8 }
                  ].map((player, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {player.rank <= 3 && (
                          <Star className="w-4 h-4 text-warning" />
                        )}
                        <span className={player.name === "You" ? "font-bold" : ""}>
                          #{player.rank} {player.name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {player.tokens} tokens
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgriGame;