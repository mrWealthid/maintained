import React from 'react'

const AppPageHeader = ({ name }: { name: string }) => {
    return (
        // <div className="flex mb-6 items-center gap-4">
        <h1 className="font-display md:text-2xl font-semibold text-foreground ">{name}</h1>

        // </div>

    )
}

export default React.memo(AppPageHeader)
