
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScoreEmailRequest {
  email: string;
  level: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, level, score, correctAnswers, totalQuestions, percentage }: ScoreEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Quiz Game <onboarding@resend.dev>",
      to: [email],
      subject: `Your Quiz Game Results - Level ${level}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">🎉 Quiz Game Results</h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Level ${level} Complete!</h2>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0;">
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #059669;">${score}</div>
                <div style="color: #6b7280; font-size: 14px;">Total Score</div>
              </div>
              
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${correctAnswers}/${totalQuestions}</div>
                <div style="color: #6b7280; font-size: 14px;">Correct Answers</div>
              </div>
              
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">${percentage}%</div>
                <div style="color: #6b7280; font-size: 14px;">Accuracy</div>
              </div>
            </div>
          </div>
          
          <div style="background-color: ${percentage >= 80 ? '#dcfce7' : percentage >= 60 ? '#fef3c7' : '#fee2e2'}; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0; color: ${percentage >= 80 ? '#166534' : percentage >= 60 ? '#92400e' : '#991b1b'};">
              ${percentage >= 80 ? '🏆 Excellent Performance!' : percentage >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
            </h3>
            <p style="margin: 10px 0 0 0; color: ${percentage >= 80 ? '#166534' : percentage >= 60 ? '#92400e' : '#991b1b'};">
              ${percentage >= 80 ? 'Outstanding work! You\'ve mastered this level.' : 
                percentage >= 60 ? 'Well done! You\'re on the right track.' : 
                'Don\'t give up! Practice makes perfect.'}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280;">Thanks for playing our Quiz Game!</p>
            <p style="color: #6b7280; font-size: 12px;">Keep challenging yourself with more levels.</p>
          </div>
        </div>
      `,
    });

    console.log("Score email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-score-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
