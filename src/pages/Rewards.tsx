import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getRewardsTracker } from "@/lib/googleSheets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Instagram, Video, ExternalLink, UploadCloud, Sparkles, Gift, CheckCircle2, Loader2 } from "lucide-react";

// Task Data Structure
interface Task {
  id: string;
  title: string;
  description: string;
  platform: "Google" | "Instagram" | "TikTok";
  rewardAmount: number;
  rewardType: string;
  link: string;
  icon: any;
}

const rewardTasks: Task[] = [
  {
    id: "g-review-brandify",
    title: "Review Brandify on Google",
    description: "Leave a 5-star review for Brandify on Google Maps to help us grow!",
    platform: "Google",
    rewardAmount: 100,
    rewardType: "Credits",
    link: "https://g.page/r/CYjq3gH_ElPFEBM/review",
    icon: Star
  },
  {
    id: "g-review-khetta",
    title: "Review Khetta on Google",
    description: "Leave a review for Khetta on Google Maps.",
    platform: "Google",
    rewardAmount: 100,
    rewardType: "Credits",
    link: "https://g.page/r/CSnKhJTpaL-DEAE/review",
    icon: Star
  },
  {
    id: "ig-follow-brandify",
    title: "Follow Brandify on Instagram",
    description: "Follow our official Instagram page for updates and tips.",
    platform: "Instagram",
    rewardAmount: 25,
    rewardType: "Credits",
    link: "https://www.instagram.com/brandify.zone/",
    icon: Instagram
  },
  {
    id: "ig-follow-khetta",
    title: "Follow Khetta on Instagram",
    description: "Follow the Khetta Instagram account.",
    platform: "Instagram",
    rewardAmount: 25,
    rewardType: "Credits",
    link: "https://www.instagram.com/alkhetta/",
    icon: Instagram
  },
  {
    id: "tk-follow-brandify",
    title: "Follow Brandify on TikTok",
    description: "Follow us on TikTok for quick tutorials and behind-the-scenes.",
    platform: "TikTok",
    rewardAmount: 25,
    rewardType: "Credits",
    link: "https://www.tiktok.com/@brandify.zone",
    icon: Video
  },
  {
    id: "tk-follow-khetta",
    title: "Follow Khetta on TikTok",
    description: "Follow the Khetta TikTok account.",
    platform: "TikTok",
    rewardAmount: 25,
    rewardType: "Credits",
    link: "https://www.tiktok.com/@alkhetta",
    icon: Video
  }
];

const Rewards = () => {
  const { client } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // State to hold task completion status from Google Sheets
  const [taskStatus, setTaskStatus] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRewards() {
      if (client?.mobile) {
        setIsLoading(true);
        try {
          const statuses = await getRewardsTracker(client.mobile);
          setTaskStatus(statuses || {});
        } catch (error) {
          console.error("Failed to fetch reward statuses", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchRewards();
  }, [client]);

  const handleUploadProof = () => {
    // This is a mockup for Phase 2 OCR integration
    alert("In Phase 2, this will upload the screenshot and process it via OCR!");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Checking your available rewards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Gift className="w-8 h-8 text-primary" />
          Rewards & Free Gifts
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete simple tasks to earn free credits and unlock premium templates.
        </p>
      </div>

      {/* TASKS GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rewardTasks.map((task) => {
          const isCompleted = taskStatus[task.id] === 'yes';

          return (
            <Card key={task.id} className={`flex flex-col h-full transition-all relative overflow-hidden group ${isCompleted ? 'opacity-60 bg-muted/30 border-dashed' : 'hover:shadow-md hover:border-primary/50'}`}>
              
              {/* Reward Badge Banner */}
              <div className="absolute top-3 right-3 z-10">
                <Badge variant={isCompleted ? "outline" : "secondary"} className={isCompleted ? "text-muted-foreground" : "bg-primary/10 text-primary border-primary/20 font-bold"}>
                  {isCompleted ? "Claimed" : `+${task.rewardAmount} ${task.rewardType}`}
                </Badge>
              </div>

              <CardHeader className="pb-4 pt-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${isCompleted ? 'bg-muted' : 'bg-muted group-hover:bg-primary/10'}`}>
                  <task.icon className={`w-6 h-6 transition-colors ${isCompleted ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'}`} />
                </div>
                <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow justify-between gap-6">
                <p className="text-sm text-muted-foreground">{task.description}</p>
                
                {isCompleted ? (
                  <Button variant="secondary" className="w-full mt-auto cursor-not-allowed bg-green-500/10 text-green-700 hover:bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Completed
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setSelectedTask(task)} 
                    className="w-full mt-auto group-hover:bg-primary/90"
                  >
                    Start Task
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* COMING SOON CARD */}
        <Card className="flex flex-col h-full border-dashed border-2 bg-muted/20 items-center justify-center text-center p-8 opacity-70">
           <Sparkles className="w-10 h-10 text-muted-foreground mb-4" />
           <CardTitle className="text-lg text-foreground mb-2">More Rewards Coming Soon</CardTitle>
           <p className="text-sm text-muted-foreground">
             We're cooking up new ways for you to earn free templates and credits. Check back later!
           </p>
        </Card>
      </div>

      {/* TASK EXECUTION MODAL */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <selectedTask.icon className="w-5 h-5 text-primary" />
                  </div>
                  <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                </div>
                <DialogDescription>
                  Follow the steps below to claim your <strong className="text-primary">{selectedTask.rewardAmount} {selectedTask.rewardType}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* STEP 1: VISIT LINK */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-foreground text-background text-xs">1</span> 
                    Complete the Action
                  </h4>
                  <p className="text-sm text-muted-foreground pl-7">
                    Click the button below to visit {selectedTask.platform} and complete the task. Make sure to take a screenshot when you are done!
                  </p>
                  <div className="pl-7">
                    <Button asChild variant="outline" className="w-full justify-between hover:bg-muted">
                      <a href={selectedTask.link} target="_blank" rel="noopener noreferrer">
                        Open {selectedTask.platform} <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* STEP 2: UPLOAD PROOF */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-foreground text-background text-xs">2</span> 
                    Upload Screenshot Proof
                  </h4>
                  <p className="text-sm text-muted-foreground pl-7">
                    Upload the screenshot showing you completed the task. Our automated system will review it and credit your account.
                  </p>
                  
                  {/* Mockup Dropzone for Phase 2 OCR */}
                  <div className="pl-7">
                    <div 
                      onClick={handleUploadProof}
                      className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <UploadCloud className="h-8 w-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                      <p className="text-sm font-medium">Click to upload screenshot</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG or JPG up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rewards;
