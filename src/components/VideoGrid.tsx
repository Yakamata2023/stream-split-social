import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Play, Pause, Volume2, VolumeX, Maximize2, Grid, Heart, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface VideoStream {
  id: string;
  url: string;
  title: string;
  videoId: string;
  thumbnail: string;
  isPlaying: boolean;
  isMuted: boolean;
}

interface VideoGridProps {
  maxScreens?: number;
}

const VideoGrid = ({ maxScreens = 4 }: VideoGridProps) => {
  const [streams, setStreams] = useState<VideoStream[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const { user } = useAuth();
  const { toast } = useToast();
  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    // Track session start
    if (streams.length > 0) {
      trackAnalytics('session_start', {
        screen_count: streams.length,
        video_ids: streams.map(s => s.videoId)
      });
    }

    return () => {
      // Track session end on unmount
      if (streams.length > 0) {
        trackSessionEnd();
      }
    };
  }, [streams.length]);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const trackAnalytics = async (eventType: string, eventData: any) => {
    if (!user) return;
    
    try {
      await supabase.from('user_analytics').insert({
        user_id: user.id,
        event_type: eventType,
        event_data: eventData,
        session_id: sessionId
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackSessionEnd = async () => {
    if (!user) return;
    
    const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    
    try {
      await supabase.from('streaming_sessions').insert({
        user_id: user.id,
        session_id: sessionId,
        youtube_video_ids: streams.map(s => s.videoId),
        screen_count: streams.length,
        duration_seconds: duration,
        ended_at: new Date().toISOString()
      });
      
      trackAnalytics('session_end', {
        duration_seconds: duration,
        screen_count: streams.length
      });
    } catch (error) {
      console.error('Session tracking error:', error);
    }
  };

  const addVideoStream = async () => {
    if (streams.length >= maxScreens) {
      toast({
        title: "Maximum screens reached",
        description: `You can only have ${maxScreens} screens active at once.`,
        variant: "destructive"
      });
      return;
    }

    const videoId = extractVideoId(newVideoUrl);
    if (!videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive"
      });
      return;
    }

    // Check if video already exists
    if (streams.some(stream => stream.videoId === videoId)) {
      toast({
        title: "Video already added",
        description: "This video is already in your stream",
        variant: "destructive"
      });
      return;
    }

    try {
      // Fetch video info (in a real app, you'd use YouTube API)
      const newStream: VideoStream = {
        id: `stream_${Date.now()}`,
        url: newVideoUrl,
        videoId,
        title: `YouTube Video ${streams.length + 1}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        isPlaying: false,
        isMuted: false
      };

      setStreams(prev => [...prev, newStream]);
      setNewVideoUrl('');
      
      trackAnalytics('video_added', {
        video_id: videoId,
        screen_count: streams.length + 1
      });

      toast({
        title: "Video added!",
        description: "Successfully added video to your stream",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add video stream",
        variant: "destructive"
      });
    }
  };

  const removeStream = (streamId: string) => {
    const stream = streams.find(s => s.id === streamId);
    setStreams(prev => prev.filter(s => s.id !== streamId));
    
    if (stream) {
      trackAnalytics('video_removed', {
        video_id: stream.videoId,
        screen_count: streams.length - 1
      });
    }
  };

  const togglePlayPause = (streamId: string) => {
    setStreams(prev => prev.map(stream => 
      stream.id === streamId 
        ? { ...stream, isPlaying: !stream.isPlaying }
        : stream
    ));
  };

  const toggleMute = (streamId: string) => {
    setStreams(prev => prev.map(stream => 
      stream.id === streamId 
        ? { ...stream, isMuted: !stream.isMuted }
        : stream
    ));
  };

  const addToFavorites = async (stream: VideoStream) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabase.from('user_favorites').insert({
        user_id: user.id,
        youtube_video_id: stream.videoId,
        video_title: stream.title,
        video_thumbnail: stream.thumbnail
      });

      toast({
        title: "Added to favorites!",
        description: "Video saved to your favorites",
        variant: "default"
      });

      trackAnalytics('video_favorited', {
        video_id: stream.videoId
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already in favorites",
          description: "This video is already in your favorites",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive"
        });
      }
    }
  };

  const shareSession = async () => {
    const shareData = {
      videos: streams.map(s => ({ id: s.videoId, title: s.title })),
      timestamp: Date.now()
    };
    
    try {
      await navigator.share({
        title: 'Split-Stream Session',
        text: `Check out my Split-Stream session with ${streams.length} videos!`,
        url: window.location.href
      });
      
      trackAnalytics('session_shared', shareData);
    } catch (error) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Session link copied to clipboard",
        variant: "default"
      });
    }
  };

  const getGridLayout = () => {
    switch (streams.length) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Video Section */}
      <Card className="border-2 border-primary/20 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add YouTube Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL here..."
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addVideoStream()}
              className="flex-1"
            />
            <Button onClick={addVideoStream} variant="stream">
              <Plus className="h-4 w-4 mr-2" />
              Add Stream
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{streams.length} / {maxScreens} screens active</span>
            {streams.length > 0 && (
              <Button variant="ghost" size="sm" onClick={shareSession}>
                <Share2 className="h-4 w-4 mr-1" />
                Share Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      {streams.length > 0 && (
        <div className={`grid gap-4 ${getGridLayout()}`}>
          {streams.map((stream) => (
            <Card key={stream.id} className="group relative overflow-hidden border-border/50 bg-gradient-card">
              <div className="relative aspect-video bg-muted">
                {/* YouTube Embed */}
                <iframe
                  src={`https://www.youtube.com/embed/${stream.videoId}?autoplay=${stream.isPlaying ? 1 : 0}&mute=${stream.isMuted ? 1 : 0}&rel=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                
                {/* Controls Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => togglePlayPause(stream.id)}
                    >
                      {stream.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleMute(stream.id)}
                    >
                      {stream.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => addToFavorites(stream)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeStream(stream.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="p-3">
                <h3 className="font-medium truncate">{stream.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    YouTube
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {stream.isPlaying && <span className="text-green-500">● Live</span>}
                    {stream.isMuted && <VolumeX className="h-3 w-3" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {streams.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Grid className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos added yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first YouTube video to start your multi-screen streaming experience
            </p>
            <Button variant="stream" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Video
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoGrid;