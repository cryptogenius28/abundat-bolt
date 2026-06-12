import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { useAuth } from '../../contexts';
import { Button } from '../../components/ui/button';

export function AddressesPage() {
  const { addresses, deleteAddress } = useAuth();

  return (
    <div className="bg-white border border-ink-200 rounded-xl">
      <div className="p-6 border-b border-ink-100 flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Addresses</h1>
        <Button asChild size="sm">
          <a href="#add-address"><Plus className="w-4 h-4 mr-1" />
            Add Address
          </a>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-ink-500 mb-4">No addresses saved yet.</p>
          <Button variant="outline" asChild>
            <a href="#add-address">Add Your First Address</a>
          </Button>
        </div>
      ) : (
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-ink-200 rounded-lg p-4 relative"
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 text-xs font-semibold text-brand flex items-center gap-1">
                  <Star className="w-3 h-3 fill-brand" />
                  Default
                </span>
              )}
              <p className="font-semibold text-ink-900 mb-1">
                {address.firstName} {address.lastName}
              </p>
              <p className="text-sm text-ink-600">
                {address.address1}
                {address.address2 && <>, {address.address2}</>}
                <br />
                {address.city}, {address.state} {address.zip}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => deleteAddress(address.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
