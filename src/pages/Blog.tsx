import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: 'The Ultimate Guide to Co-Living: What You Need to Know',
      excerpt: 'Discover everything about co-living - from benefits to choosing the right space for your lifestyle.',
      author: 'Sarah Johnson',
      date: '2024-01-10',
      readTime: '5 min read',
      category: 'Guide',
      image: 'photo-1649972904349-6e44c42644a7'
    },
    {
      id: 2,
      title: '10 Tips for Making the Most of Your Co-Living Experience',
      excerpt: 'Learn how to build meaningful relationships and create a positive living environment with your housemates.',
      author: 'Michael Chen',
      date: '2024-01-08',
      readTime: '4 min read',
      category: 'Tips',
      image: 'photo-1721322800607-8c38375eef04'
    },
    {
      id: 3,
      title: 'Remote Work in Co-Living Spaces: Creating Your Perfect Setup',
      excerpt: 'How to optimize your workspace and maintain productivity while living in a shared environment.',
      author: 'Emily Rodriguez',
      date: '2024-01-05',
      readTime: '6 min read',
      category: 'Remote Work',
      image: 'photo-1488590528505-98d2b5aba04b'
    },
    {
      id: 4,
      title: 'Student Housing Revolution: Why Co-Living is the Future',
      excerpt: 'Exploring how co-living is transforming the student housing landscape and creating better communities.',
      author: 'David Park',
      date: '2024-01-03',
      readTime: '7 min read',
      category: 'Education',
      image: 'photo-1483058712412-4245e9b90334'
    },
    {
      id: 5,
      title: 'Building Community: Events That Bring Residents Together',
      excerpt: 'Creative ideas for organizing community events that foster connections and create lasting friendships.',
      author: 'Lisa Wong',
      date: '2024-01-01',
      readTime: '5 min read',
      category: 'Community',
      image: 'photo-1721322800607-8c38375eef04'
    },
    {
      id: 6,
      title: 'Sustainable Living in Co-Living Spaces',
      excerpt: 'How shared living contributes to environmental sustainability and reduces our carbon footprint.',
      author: 'Tom Anderson',
      date: '2023-12-28',
      readTime: '4 min read',
      category: 'Sustainability',
      image: 'photo-1649972904349-6e44c42644a7'
    }
  ];

  const categories = ['All', 'Guide', 'Tips', 'Remote Work', 'Education', 'Community', 'Sustainability'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Blog & Updates
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Stay updated with the latest trends, tips, and insights about co-living and community building.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'All' ? 'default' : 'outline'}
                size="sm"
                className={category === 'All' ? 'bg-secondary hover:bg-secondary/90' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Featured Post</h2>
          </div>
          
          <Card className="overflow-hidden border-0 shadow-medium">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-auto">
                <img 
                  src={`https://images.unsplash.com/${posts[0].image}?w=600&h=400&fit=crop`}
                  alt={posts[0].title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
                  Featured
                </Badge>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4" variant="outline">
                  {posts[0].category}
                </Badge>
                <h3 className="text-2xl font-bold mb-4">{posts[0].title}</h3>
                <p className="text-muted-foreground mb-6">{posts[0].excerpt}</p>
                
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <User className="h-4 w-4 mr-2" />
                  <span className="mr-4">{posts[0].author}</span>
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="mr-4">{new Date(posts[0].date).toLocaleDateString()}</span>
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{posts[0].readTime}</span>
                </div>
                
                <Button className="w-fit">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Recent Posts</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <Card key={post.id} className="overflow-hidden bg-background border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48">
                  <img 
                    src={`https://images.unsplash.com/${post.image}?w=400&h=250&fit=crop`}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-background/90 text-foreground">
                    {post.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <User className="h-3 w-3 mr-1" />
                    <span className="mr-3">{post.author}</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="mr-3">{new Date(post.date).toLocaleDateString()}</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90">
              Load More Posts
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-soft bg-gradient-card">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Subscribe to our newsletter to get the latest insights, tips, and updates about co-living directly in your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <Button className="bg-secondary hover:bg-secondary/90">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;