import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { careers } from '../../data/mockData';

export function CareersPage() {
  useEffect(() => {
    document.title = 'Careers | Abundant Merchandise';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Join Our Team
        </h1>
        <p className="text-ink-600">
          We are always looking for talented people to help us deliver great experiences.
        </p>
      </div>

      {/* Values */}
      <div className="bg-ink-50 rounded-xl p-8 mb-12">
        <h2 className="text-xl font-semibold mb-4">Why Abundant Merchandise?</h2>
        <div className="grid md:grid-cols-2 gap-6 text-ink-600">
          <div>
            <h3 className="font-semibold text-ink-900 mb-1">Competitive Benefits</h3>
            <p className="text-sm">Health insurance, 401(k) matching, generous PTO.</p>
          </div>
          <div>
            <h3 className="font-semibold text-ink-900 mb-1">Remote-Friendly</h3>
            <p className="text-sm">Many roles offer flexible work arrangements.</p>
          </div>
          <div>
            <h3 className="font-semibold text-ink-900 mb-1">Growth Opportunities</h3>
            <p className="text-sm">Learn and grow with mentorship and training programs.</p>
          </div>
          <div>
            <h3 className="font-semibold text-ink-900 mb-1">Amazing Team</h3>
            <p className="text-sm">Work with passionate, collaborative colleagues.</p>
          </div>
        </div>
      </div>

      {/* Open positions */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Open Positions</h2>

        {careers.length === 0 ? (
          <p className="text-ink-500 text-center py-8">
            No open positions at this time. Check back soon!
          </p>
        ) : (
          <div className="space-y-4">
            {careers.map((job) => (
              <div
                key={job.id}
                className="border border-ink-200 rounded-xl p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900 mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link to={`/apply?job=${job.id}`}>Apply Now</Link>
                  </Button>
                </div>

                <p className="text-sm text-ink-600 mt-4 mb-4">{job.description}</p>

                <div>
                  <p className="text-sm font-semibold text-ink-900 mb-2">Requirements:</p>
                  <ul className="text-sm text-ink-600 space-y-1">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-brand">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
