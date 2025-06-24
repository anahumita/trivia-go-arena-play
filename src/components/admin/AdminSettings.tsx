
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Save, Download, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    gameSettings: {
      maxQuestionsPerLevel: 10,
      timePerQuestion: 15,
      pointsPerCorrectAnswer: 10,
      enableHints: true,
      enableExplanations: true,
    },
    emailSettings: {
      enableEmailResults: true,
      senderName: 'Trivia Game',
      senderEmail: 'noreply@triviagame.com',
    },
    systemSettings: {
      maintenanceMode: false,
      allowNewRegistrations: true,
      requireEmailVerification: true,
    }
  });

  const handleSaveSettings = async () => {
    try {
      // In a real application, you would save these settings to your database
      // For now, we'll just save to localStorage and show a success message
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleExportData = () => {
    // In a real application, you would export data from your database
    const dataToExport = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trivia-game-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.settings) {
          setSettings(importedData.settings);
          toast.success('Settings imported successfully!');
        } else {
          toast.error('Invalid settings file format');
        }
      } catch (error) {
        console.error('Error importing settings:', error);
        toast.error('Failed to import settings');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Game Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Game Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxQuestions">Max Questions Per Level</Label>
              <Input
                id="maxQuestions"
                type="number"
                value={settings.gameSettings.maxQuestionsPerLevel}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  gameSettings: {
                    ...prev.gameSettings,
                    maxQuestionsPerLevel: parseInt(e.target.value)
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="timePerQuestion">Time Per Question (seconds)</Label>
              <Input
                id="timePerQuestion"
                type="number"
                value={settings.gameSettings.timePerQuestion}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  gameSettings: {
                    ...prev.gameSettings,
                    timePerQuestion: parseInt(e.target.value)
                  }
                }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="pointsPerAnswer">Points Per Correct Answer</Label>
            <Input
              id="pointsPerAnswer"
              type="number"
              value={settings.gameSettings.pointsPerCorrectAnswer}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                gameSettings: {
                  ...prev.gameSettings,
                  pointsPerCorrectAnswer: parseInt(e.target.value)
                }
              }))}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableHints">Enable Hints</Label>
              <Switch
                id="enableHints"
                checked={settings.gameSettings.enableHints}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  gameSettings: {
                    ...prev.gameSettings,
                    enableHints: checked
                  }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableExplanations">Enable Explanations</Label>
              <Switch
                id="enableExplanations"
                checked={settings.gameSettings.enableExplanations}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  gameSettings: {
                    ...prev.gameSettings,
                    enableExplanations: checked
                  }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enableEmailResults">Enable Email Results</Label>
            <Switch
              id="enableEmailResults"
              checked={settings.emailSettings.enableEmailResults}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                emailSettings: {
                  ...prev.emailSettings,
                  enableEmailResults: checked
                }
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Sender Name</Label>
              <Input
                id="senderName"
                value={settings.emailSettings.senderName}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  emailSettings: {
                    ...prev.emailSettings,
                    senderName: e.target.value
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="senderEmail">Sender Email</Label>
              <Input
                id="senderEmail"
                type="email"
                value={settings.emailSettings.senderEmail}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  emailSettings: {
                    ...prev.emailSettings,
                    senderEmail: e.target.value
                  }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Prevents users from playing games
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.systemSettings.maintenanceMode}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  systemSettings: {
                    ...prev.systemSettings,
                    maintenanceMode: checked
                  }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allowRegistrations">Allow New Registrations</Label>
              <Switch
                id="allowRegistrations"
                checked={settings.systemSettings.allowNewRegistrations}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  systemSettings: {
                    ...prev.systemSettings,
                    allowNewRegistrations: checked
                  }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="requireVerification">Require Email Verification</Label>
              <Switch
                id="requireVerification"
                checked={settings.systemSettings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  systemSettings: {
                    ...prev.systemSettings,
                    requireEmailVerification: checked
                  }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleExportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
                id="import-file"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('import-file')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Settings
              </Button>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Note</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Importing settings will overwrite current settings. Make sure to export your current settings as a backup before importing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
