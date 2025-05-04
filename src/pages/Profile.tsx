
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface ProfileFormValues {
  username: string;
  email: string;
  bio?: string;
  favorite_categories?: string[];
}

const Profile = () => {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      favorite_categories: []
    }
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        // Get user data from users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Failed to load profile data');
          return;
        }
        
        if (data) {
          // Set form values
          form.reset({
            username: data.username || '',
            email: data.email || user.email || '',
            bio: data.bio || '',
            favorite_categories: data.favorite_categories || []
          });
        }
      } catch (error) {
        console.error('Exception fetching user profile:', error);
        toast.error('An error occurred while loading your profile');
      }
    };
    
    fetchUserProfile();
  }, [user, form.reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Update user data in the users table
      const { error } = await supabase
        .from('users')
        .update({
          username: values.username,
          bio: values.bio,
          favorite_categories: values.favorite_categories
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return;
      }
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Exception updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = () => {
    const currentCategories = form.getValues().favorite_categories || [];
    const input = document.getElementById('new-category') as HTMLInputElement;
    const newCategory = input?.value?.trim();
    
    if (!newCategory) return;
    
    if (!currentCategories.includes(newCategory)) {
      form.setValue('favorite_categories', [...currentCategories, newCategory]);
      input.value = '';
    }
  };

  const handleRemoveCategory = (category: string) => {
    const currentCategories = form.getValues().favorite_categories || [];
    form.setValue(
      'favorite_categories',
      currentCategories.filter(c => c !== category)
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{isEditing ? 'Edit Profile' : 'User Profile'}</CardTitle>
                    <CardDescription>
                      {isEditing ? 'Update your personal information' : 'View your personal information'}
                    </CardDescription>
                  </div>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us a bit about yourself"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <Label>Favorite Categories</Label>
                      <div className="flex items-center space-x-2">
                        <Input id="new-category" placeholder="Add a category" className="flex-1" />
                        <Button type="button" onClick={handleAddCategory} size="sm">Add</Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.watch('favorite_categories')?.map((category, index) => (
                          <div 
                            key={index} 
                            className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            {category}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveCategory(category)}
                              className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <CardFooter className="px-0 flex gap-2 justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Username</Label>
                    <p className="font-medium">{form.getValues().username}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{form.getValues().email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="font-medium">{form.getValues().bio || 'No bio provided'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Favorite Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.getValues().favorite_categories?.length ? (
                        form.getValues().favorite_categories.map((category, index) => (
                          <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                            {category}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No favorite categories</p>
                      )}
                    </div>
                  </div>
                  
                  <CardFooter className="px-0 border-t pt-4">
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                      Back to Dashboard
                    </Button>
                  </CardFooter>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
