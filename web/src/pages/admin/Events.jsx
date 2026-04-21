import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, StarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { format } from 'date-fns'

export default function AdminEvents() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 10 })
      if (status) params.append('status', status)
      const response = await api.get(`/events?${params}`)
      return response.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events'])
      toast.success('Event deleted')
    },
    onError: () => toast.error('Failed to delete event')
  })

  const toggleFeatured = useMutation({
    mutationFn: (id) => api.patch(`/events/${id}/featured`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events'])
      toast.success('Featured status updated')
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link to="/admin/events/new" className="btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      <div className="card mb-6 p-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input w-auto"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data?.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      {event.coverImage ? (
                        <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full gradient-bg opacity-50" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <div className="flex gap-1 mt-1">
                        {event.categories?.slice(0, 2).map((cat) => (
                          <span key={cat._id} className="text-xs text-gray-500">{cat.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{event.region}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {format(new Date(event.startDate), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.status === 'published' ? 'bg-green-100 text-green-700' :
                    event.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                    event.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    event.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {event.viewsCount}
                    </span>
                    <span>{event.applicationsCount} apps</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleFeatured.mutate(event._id)}
                      className={`p-2 rounded-lg ${event.featured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      <StarIcon className="w-4 h-4" />
                    </button>
                    <Link to={`/admin/events/${event._id}/edit`} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Delete this event?')) {
                          deleteMutation.mutate(event._id)
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(data.pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-lg font-medium ${
                page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
