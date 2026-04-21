import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarDaysIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  MapPinIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const response = await api.get('/public/homepage')
      return response.data.data
    }
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              Connect with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-300">
                Top Influencers
              </span>{' '}
              for Your Events
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-2xl">
              InfluenceHub bridges the gap between brands and influencers. 
              Discover amazing events, collaborate with creators, and amplify your reach.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/events" className="btn-primary text-lg px-6 py-3">
                Browse Events
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/influencers" className="btn bg-white/10 backdrop-blur text-white hover:bg-white/20 text-lg px-6 py-3">
                View Influencers
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-2xl"
          >
            {[
              { label: 'Active Events', value: '500+' },
              { label: 'Influencers', value: '10K+' },
              { label: 'Collaborations', value: '25K+' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-primary-200">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Current Events */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                Current Events
              </h2>
              <p className="text-gray-600 mt-1">Happening right now</p>
            </div>
            <Link to="/events" className="btn-outline text-sm">
              View All
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {data?.currentEvents?.map((event) => (
                <motion.div key={event._id} variants={itemVariants}>
                  <Link to={`/events/${event._id}`} className="card-hover group block">
                    <div className="relative h-48 bg-gray-100">
                      {event.coverImage ? (
                        <img
                          src={event.coverImage}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full gradient-bg opacity-20" />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                          Live Now
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {event.categories?.slice(0, 2).map((cat) => (
                          <span
                            key={cat._id}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4" />
                        {event.region}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 lg:py-24 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                Upcoming Events
              </h2>
              <p className="text-gray-600 mt-1">Don't miss these opportunities</p>
            </div>
            <Link to="/events?upcoming=true" className="btn-outline text-sm">
              View All
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {!isLoading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {data?.upcomingEvents?.map((event) => (
                <motion.div key={event._id} variants={itemVariants}>
                  <Link to={`/events/${event._id}`} className="card-hover group block">
                    <div className="relative h-48 bg-gray-100">
                      {event.coverImage ? (
                        <img
                          src={event.coverImage}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full gradient-bg opacity-20" />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                          {format(new Date(event.startDate), 'MMM d')}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {event.categories?.slice(0, 2).map((cat) => (
                          <span
                            key={cat._id}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4" />
                        {event.region}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Top Influencers */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                Top Influencers
              </h2>
              <p className="text-gray-600 mt-1">Proven track record with completed events</p>
            </div>
            <Link to="/influencers" className="btn-outline text-sm">
              View All
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {!isLoading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {data?.topInfluencers?.map((influencer) => (
                <motion.div key={influencer._id} variants={itemVariants}>
                  <Link
                    to={`/influencers/${influencer._id}`}
                    className="card-hover group block text-center p-6"
                  >
                    <div className="relative inline-block mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto">
                        {influencer.user?.avatar ? (
                          <img
                            src={influencer.user.avatar}
                            alt={influencer.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full gradient-bg flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {influencer.user?.name?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      {influencer.verified && (
                        <CheckBadgeIcon className="absolute bottom-0 right-0 w-6 h-6 text-primary-600 bg-white rounded-full" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {influencer.user?.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {influencer.totalFollowers?.toLocaleString()} followers
                    </p>
                    <p className="text-xs text-primary-600 mt-2">
                      {influencer.completedEvents} events completed
                    </p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 gradient-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Ready to Amplify Your Reach?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of influencers and brands creating impactful collaborations on InfluenceHub.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/events" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                Explore Events
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
