import SectionCard from "@/components/SectionCard";
import type { Context } from "@/lib/types";

export default function ImportantInfo({
  context,
  phone,
}: {
  context: Context;
  phone: string;
}) {
  return (
    <SectionCard title="Important Info">
      <div className="text-sm grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-semibold opacity-70">Property</div>
          <div>{context.property_name || "—"}</div>
        </div>
        <div>
          <div className="text-xs font-semibold opacity-70">Tenant</div>
          <div>{context.tenant_name}</div>
        </div>
        <div>
          <div className="text-xs font-semibold opacity-70">Unit</div>
          <div>{context.unit}</div>
        </div>
        <div>
          <div className="text-xs font-semibold opacity-70">Phone</div>
          <div>{phone}</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs font-semibold opacity-70">Address</div>
          <div>{context.address}</div>
        </div>
        <div>
          <div className="text-xs font-semibold opacity-70">Hotline</div>
          <div>{context.hotline || "—"}</div>
        </div>
        <div>
          <div className="text-xs font-semibold opacity-70">Portal</div>
          <a
            className="text-blue-600 hover:underline cursor-pointer"
            href={context.portal_url}
            target="_blank"
            rel="noreferrer"
          >
            {context.portal_url || "—"}
          </a>
        </div>
      </div>
    </SectionCard>
  );
}
