'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Home, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/lib/useAnalytics';
import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import AuthWrapper from '@/components/AuthWrapper';
import InsightsBarChart from '@/components/InsightsBarChart';
import InsightsLiquidGauge from '@/components/InsightsLiquidGauge';
import InsightsGeneralHealth from '@/components/InsightsGeneralHealth';
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'


export default function Insights() {
	const [showCategories, setShowCategories] = useState(false);
	const { data: session, status } = useSession();
	const { trackEvent } = useAnalytics();
	const router = useRouter();

	const handleSignOut = async () => {
    trackEvent('user_logout', { email: session?.user?.email })
    await signOut({ callbackUrl: '/' })
  }

  const handleHome = () => {
    router.push('/senior-sense-demo');
  }

  const handleToggleCategories = () => {
  	setShowCategories(prev => !prev)
  }

	useEffect(() => {
    if (status === 'authenticated') {
      trackEvent('user_login', { email: session?.user?.email })
    }
  }, [status, session, trackEvent])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

	return (
		<AuthWrapper>
		<div className="h-full flex flex-col">
      <div className="w-full h-screen overflow-hidden absolute left-0 top-0 z-[2] pointer-events-none">
        <div className="border-0 bg-[url('/background.svg')] bg-center bg-no-repeat bg-cover w-full h-1/2 absolute left-0 top-0 z-[1] max-h-[400px]"></div>
        <div className="absolute left-1/2 top-[270px] w-[670px] lg:w-3/5 lg:min-w-[907px] aspect-square rounded-full bg-white z-[2] -translate-x-1/2"></div>
      </div>
      <Card className="w-full flex-1 border-0 relative z-[3] bg-transparent shadow-none flex flex-col">
        <Header />
        <CardContent className="py-12 max-w-[614px] lg:w-3/5 w-full mx-auto min-h-[500px] flex-1">
          <h1 className="font-semibold text-primary-foreground text-center text-2xl">Insights</h1>
          <div className="flex justify-end w-full mt-24">
        		<button onClick={handleToggleCategories}>
	           	<Image
	           		src="/category-icon.svg"
	           		alt=""
	           		width={100}
	           		height={100}
	           		className="w-6 h-auto"
	           	/>
            </button>
          </div>
          {!showCategories ? 
          (<AnimatePresence mode="wait">
          	<motion.div
	            key="charts"
	            initial={{ y: 10, opacity: 0 }}
	            animate={{ y: 0, opacity: 1 }}
	            exit={{ y: -10, opacity: 0 }}
	            transition={{ duration: 0.2 }}
	          >
          	<div className="mt-5">
            	<div>
            		<h3 className="text-accent text-lg font-semibold mb-5">Status</h3>
            		<p>
            			Today Mila is feeling overall ok, but has some headache and feels a bit lonely.
            		</p>
            	</div>
            	<div>
            		<InsightsBarChart />
            	</div>
            	<div>
            		<div className="flex gap-8 items-start mt-12">
	            		<Image
			           		src="/heart.svg"
			           		alt=""
			           		width={100}
			           		height={100}
			           		className="w-24 h-auto"
			           	/>
			           	<p>
			           		<span className="block font-semibold text-accent text-3xl tracking-tight pb-2">7/10</span>
			           		<span>Mila is less lonely today, but she would appreciate a short call with you</span>
			           	</p>
		           	</div>
            	</div>
            	<div>
            		<InsightsLiquidGauge />
            	</div>
            	<div className="mt-12">
            		<h3 className="text-accent text-lg font-semibold mb-5">General Health</h3>
            		<InsightsGeneralHealth />
            	</div>
            </div>
            </motion.div>
            </AnimatePresence>)
          :
          (<AnimatePresence mode="wait">
          	<motion.div
	            key="categories"
	            initial={{ y: 10, opacity: 0 }}
	            animate={{ y: 0, opacity: 1 }}
	            exit={{ y: -10, opacity: 0 }}
	            transition={{ duration: 0.2 }}
	          >
          	<div className="py-12">
          	<ul className="flex flex-wrap gap-y-10">
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/general.svg"
				            alt="General Health"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>General Health</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/pain-level.svg"
				            alt="Pain Level"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Pain Level</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/fatigue.svg"
				            alt="Fatigue"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Fatigue/Tiredness</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/mood.svg"
				            alt="Mood"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Mood</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/emotion-wellbeing.svg"
				            alt="Emotional Well Being"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Emotional <br/> Well-being</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/loneliness.svg"
				            alt="Loneliness"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Loneliness</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/cognitive.svg"
				            alt="Cognitive Decline"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Cognitive Decline</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/alert.svg"
				            alt="Alertness"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Alertness</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/appetite.svg"
				            alt="Appetive Levels"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Appetite Levels</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/need-assistance.svg"
				            alt="Need For Assistance"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Need for <br/>Assistance</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/physical-activity.svg"
				            alt="Physical Activity"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Physical Activity</p>
          		</li>
          		<li className="flex flex-col items-center w-1/3 text-center">
          			<div className="h-14 flex justify-center items-center mb-1">
	          			<Image
				            src="/conversation.svg"
				            alt="Conversation Levels"
				            width={100}
				            height={100}
				            className="w-12 h-auto"
				          />
			          </div>
          			<p>Conversation <br/>Levels</p>
          		</li>
          	</ul>
          	</div>
          	</motion.div>
          </AnimatePresence>)
        	}
        </CardContent>
      </Card>
      <Footer />
    </div>
    </AuthWrapper>
	)
}