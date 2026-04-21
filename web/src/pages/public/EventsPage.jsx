import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import { format } from 'date-fns'

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')

  const { data, isLoading } = useQuery({
    queryKey: ['events', Object.fromEntries(searchParams)],
    queryFn: async () => {
      const params = new URLSearchParams(searchParams)
      if (!params.has('status')) {
        params.set('status', 'published')
      }
      const response = await api.get(`/events?${params.toString()}`)
      return response.data
    }
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories?type=event')
      return response.data.data
    }
  })

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response = await api.get('/public/regions')
      return response.data.data
    }
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (search) {
      searchParams.set('q', search)
    } else {
      searchParams.delete('q')
    }
    searchParams.set('page', '1')
    setSearchParams(searchParams)
  }

  const handleFilter = (key, value) => {
    if (value) {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    searchParams.set('page', '1')
    setSearchParams(searchParams)
  }

  const getStatusBadge = (event) => {
    const now = new Date()
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)

    if (event.status === 'ongoing' || (now >= start && now <= end)) {
      return { text: 'Live Now', color: 'bg-green-500' }
    }
    if (now < start) {
      return { text: format(start, 'MMM d'), color: 'bg-primary-600' }
    }
    return { text: 'Completed', color: 'bg-gray-500' }
  }

  return (
    <div className="py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Browse Events
          </h1>
          <p className="text-gray-600 mt-1">
            Discover opportunities to collaborate with top brands
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-4">
            <select
              value={searchParams.get('region') || ''}
              onChange={(e) => handleFilter('region', e.target.value)}
              className="input w-auto"
            >
              <option value="">All Regions</option>
              {regions?.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              value={searchParams.get('category') || ''}
              onChange={(e) => handleFilter('category', e.target.value)}
              className="input w-auto"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={searchParams.get('upcoming') || ''}
              onChange={(e) => handleFilter('upcoming', e.target.value)}
              className="input w-auto"
            >
              <option value="">All Events</option>
              <option value="true">Upcoming Only</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data?.map((event) => {
                const badge = getStatusBadge(event)
                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
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
                          <span className={`px-3 py-1 ${badge.color} text-white text-xs font-medium rounded-full`}>
                            {badge.text}
                          </span>
                        </div>
                        {event.featured && (
                          <div className="absolute top-3 right-3">
                            <span className="px-3 py-1 bg-accent-600 text-white text-xs font-medium rounded-full">
                              Featured
                            </span>
                          </div>
                        )}
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
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {event.shortDescription || event.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {event.region}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            {format(new Date(event.startDate), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Pagination */}
            {data?.pagination?.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(data.pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleFilter('page', String(i + 1))}
                    className={`w-10 h-10 rounded-lg font-medium ${
                      data.pagination.page === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
