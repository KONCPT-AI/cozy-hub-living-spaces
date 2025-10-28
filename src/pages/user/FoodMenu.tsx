import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Coffee, UtensilsCrossed, Moon, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';
import UserLayout from '@/components/UserLayout';

interface FoodMenu {
  id: string;
  menu_date: string;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  breakfast_image: string | null;
  lunch_image: string | null;
  dinner_image: string | null;
}

const FoodMenu = () => {
  const { toast } = useToast();
  const [todayMenu, setTodayMenu] = useState<FoodMenu | null>(null);
  const [tomorrowMenu, setTomorrowMenu] = useState<FoodMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      // First get user's property from their active booking
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          room_id,
          rooms (
            property_id
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (!bookings) {
        toast({ title: 'No active booking found', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const propertyId = (bookings.rooms as any)?.property_id;
      if (!propertyId) {
        setIsLoading(false);
        return;
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

      // Fetch today's menu
      const { data: todayData } = await supabase
        .from('food_menus')
        .select('*')
        .eq('property_id', propertyId)
        .eq('menu_date', today)
        .eq('status', 'published')
        .maybeSingle();

      setTodayMenu(todayData);

      // Fetch tomorrow's menu
      const { data: tomorrowData } = await supabase
        .from('food_menus')
        .select('*')
        .eq('property_id', propertyId)
        .eq('menu_date', tomorrow)
        .eq('status', 'published')
        .maybeSingle();

      setTomorrowMenu(tomorrowData);
    } catch (error: any) {
      toast({ title: 'Error fetching menus', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const MealCard = ({ 
    title, 
    content, 
    image, 
    icon: Icon 
  }: { 
    title: string; 
    content: string | null; 
    image: string | null; 
    icon: any;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {image && (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-32 object-cover rounded-md mb-3"
          />
        )}
        {content ? (
          <p className="text-sm whitespace-pre-line">{content}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Not available</p>
        )}
      </CardContent>
    </Card>
  );

  const MenuSection = ({ 
    title, 
    date, 
    menu 
  }: { 
    title: string; 
    date: Date; 
    menu: FoodMenu | null;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">{title}</h2>
        <span className="text-muted-foreground">({format(date, 'PPP')})</span>
      </div>

      {menu ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MealCard 
            title="Breakfast" 
            content={menu.breakfast}
            image={menu.breakfast_image}
            icon={Coffee}
          />
          <MealCard 
            title="Lunch" 
            content={menu.lunch}
            image={menu.lunch_image}
            icon={UtensilsCrossed}
          />
          <MealCard 
            title="Dinner" 
            content={menu.dinner}
            image={menu.dinner_image}
            icon={Moon}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Menu not available yet for this day.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <p>Loading menus...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Food Menu</h1>
          <p className="text-muted-foreground">
            View daily meal schedules for your property
          </p>
        </div>

        <MenuSection 
          title="Today's Menu" 
          date={new Date()} 
          menu={todayMenu}
        />

        <MenuSection 
          title="Tomorrow's Menu" 
          date={addDays(new Date(), 1)} 
          menu={tomorrowMenu}
        />
      </div>
    </UserLayout>
  );
};

export default FoodMenu;