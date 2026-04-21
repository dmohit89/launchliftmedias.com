import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckBadgeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format, formatDistanceToNow } from 'date-fns'

export default function EventDetailPage() {
  const { id } = useParams()

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get(`/public/events/${id}`)
      return response.data.data
    }
  })

  if (isLoading) {
    return (
      <div className="py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-64 lg:h-96 bg-gray-200 rounded-xl mb-8" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Event not found</h1>
          <Link to="/events" className="btn-primary mt-4">
            Browse Events
          </Link>
        </div>
      </div>
    )
  }

  const isUpcoming = new Date(event.startDate) > new Date()
  const acceptingApplications = new Date(event.applicationDeadline) > new Date() && event.status === 'published'

  return (
    <div className="py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/events" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Cover Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-64 lg:h-96 rounded-xl overflow-hidden mb-8"
            >
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full gradient-bg" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.categories?.map((cat) => (
                    <span
                      key={cat._id}
                      className="px-3 py-1 bg-white/20 backdrop-blur text-white text-sm rounded-full"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl lg:text-4xl font-display font-bold text-white">
                  {event.title}
                </h1>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
              <div className="prose prose-gray max-w-none">
                {event.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </motion.div>

            {/* Requirements */}
            {event.requirements?.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6 mb-8"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <p className="text-gray-600">{event.requirements.description}</p>
                {event.requirements.minFollowers > 0 && (
                  <p className="mt-3 text-sm text-gray-500">
                    Minimum followers required: <strong>{event.requirements.minFollowers.toLocaleString()}</strong>
                  </p>
                )}
              </motion.div>
            )}

            {/* Assigned Influencers */}
            {event.assignedInfluencers?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Influencers</h2>
                <div className="flex flex-wrap gap-4">
                  {event.assignedInfluencers
                    .filter(a => a.status === 'confirmed')
                    .map((assignment) => (
                      <Link
                        key={assignment.influencer?._id}
                        to={`/influencers/${assignment.influencer?._id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                          {assignment.influencer?.user?.avatar ? (
                            <img
                              src={assignment.influencer.user.avatar}
                              alt={assignment.influencer.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full gradient-bg flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {assignment.influencer?.user?.name?.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {assignment.influencer?.user?.name}
                        </span>
                      </Link>
                    ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 sticky top-24"
            >
              {/* Status Badge */}
              <div className="mb-6">
                {acceptingApplications ? (
                  <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Accepting Applications
                  </span>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    Applications Closed
                  </span>
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(event.startDate), 'MMM d')} - {format(new Date(event.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">
                      {event.location?.venue || event.region}
                    </p>
                    {event.location?.city && (
                      <p className="text-sm text-gray-500">
                        {event.location.city}, {event.location.country}
                      </p>
                    )}
                  </div>
                </div>

                {event.compensation && (
                  <div className="flex items-start gap-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Compensation</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {event.compensation.type}
                        {event.compensation.amount && ` - $${event.compensation.amount}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Application Deadline</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(event.applicationDeadline), 'MMM d, yyyy')}
                    </p>
                    {acceptingApplications && (
                      <p className="text-sm text-primary-600">
                        {formatDistanceToNow(new Date(event.applicationDeadline), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>

                {event.capacity && (
                  <div className="flex items-start gap-3">
                    <UserGroupIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium text-gray-900">
                        {event.capacity} spots
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Organizer */}
              {event.organizer?.company && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Organized by</p>
                  <p className="font-medium text-gray-900">{event.organizer.company}</p>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between text-sm">
                <div>
                  <p className="text-gray-500">Views</p>
                  <p className="font-semibold text-gray-900">{event.viewsCount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Applications</p>
                  <p className="font-semibold text-gray-900">{event.applicationsCount?.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
