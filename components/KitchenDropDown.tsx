import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface KitchenDropDownProps<T extends string> {
  value: T;
  setValue: (value: T) => void;
  options: readonly T[];
  label: string;
  disabled?: boolean;
}

export default function KitchenDropDown<T extends string>({
  value,
  setValue,
  options,
  label,
  disabled = false,
}: KitchenDropDownProps<T>) {
  return (
    <Listbox value={value} onChange={setValue} disabled={disabled}>
      {({ open }) => (
        <>
          <Listbox.Label className="label">
            {label}
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className={classNames(
              "input-modern cursor-default text-left pr-10 transition-colors",
              disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"
            )}>
              <span className="flex items-center">
                <span className="ml-1 block truncate">{value}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="dropdown-content absolute mt-1 max-h-56 w-full overflow-auto">
                {options.map((option) => (
                  <Listbox.Option
                    key={option}
                    className="dropdown-item"
                    value={option}
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-1 block truncate"
                            )}
                          >
                            {option}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              "text-primary",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}