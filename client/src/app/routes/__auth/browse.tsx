import { useState } from 'react'
import PreviewCard from '@/components/preview-card'
import { Filters } from '@/components/filters'
import { SearchBar } from '@/components/search-bar'
import { BaseCard } from '@/components/base-card'
import BrowseList from '@/components/browse-list'

export function Component() {

  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Find Your Match</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <SearchBar />

      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-8">
        <Filters/>

        <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <BrowseList />
        </div>
      </div>
    </div>
  )
}
