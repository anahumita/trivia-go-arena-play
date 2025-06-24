
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question } from '@/types/game';

interface DatabaseQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<DatabaseQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DatabaseQuestion | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    difficulty: 'easy',
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: ''
  });

  const categories = [
    'General Knowledge', 'Science', 'History', 'Geography', 'Sports', 
    'Entertainment', 'Technology', 'Literature', 'Art', 'Music'
  ];

  const difficulties = ['easy', 'medium', 'hard'];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error loading questions:', error);
        toast.error('Failed to load questions');
        return;
      }

      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question || !formData.correct_answer || formData.options.some(opt => !opt)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingQuestion) {
        // Update existing question
        const { error } = await supabase
          .from('questions')
          .update({
            category: formData.category,
            difficulty: formData.difficulty,
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correct_answer,
            explanation: formData.explanation
          })
          .eq('id', editingQuestion.id);

        if (error) {
          console.error('Error updating question:', error);
          toast.error('Failed to update question');
          return;
        }

        toast.success('Question updated successfully');
      } else {
        // Add new question
        const { error } = await supabase
          .from('questions')
          .insert([{
            category: formData.category,
            difficulty: formData.difficulty,
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correct_answer,
            explanation: formData.explanation
          }]);

        if (error) {
          console.error('Error adding question:', error);
          toast.error('Failed to add question');
          return;
        }

        toast.success('Question added successfully');
      }

      // Reset form and reload questions
      resetForm();
      loadQuestions();
      setIsAddDialogOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question');
        return;
      }

      toast.success('Question deleted successfully');
      loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleEdit = (question: DatabaseQuestion) => {
    setEditingQuestion(question);
    setFormData({
      category: question.category,
      difficulty: question.difficulty,
      question: question.question,
      options: question.options,
      correct_answer: question.correct_answer,
      explanation: question.explanation || ''
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      difficulty: 'easy',
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: ''
    });
    setEditingQuestion(null);
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading questions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Question Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={formData.category} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={formData.difficulty} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, difficulty: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map(diff => (
                          <SelectItem key={diff} value={diff}>
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Question</label>
                  <Textarea
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter the question..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Options</label>
                  {formData.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData(prev => ({ ...prev, options: newOptions }));
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="mt-2"
                    />
                  ))}
                </div>
                
                <div>
                  <label className="text-sm font-medium">Correct Answer</label>
                  <Select value={formData.correct_answer} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, correct_answer: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.options.map((option, index) => (
                        <SelectItem key={index} value={option} disabled={!option}>
                          {option || `Option ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Explanation (Optional)</label>
                  <Textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Explain why this is the correct answer..."
                    rows={2}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingQuestion ? 'Update' : 'Add'} Question
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {difficulties.map(diff => (
                <SelectItem key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Questions Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Correct Answer</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="max-w-md">
                  <p className="truncate">{question.question}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{question.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      question.difficulty === 'easy' ? 'default' :
                      question.difficulty === 'medium' ? 'secondary' : 'destructive'
                    }
                  >
                    {question.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-sm">
                  <p className="truncate">{question.correct_answer}</p>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No questions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminQuestions;
