import React, { useState } from 'react'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
    // Call the original onError handler if provided
    if (props.onError) {
      props.onError(new Event('error') as any)
    }
  }

  const { src, alt, style, className, onError, ...rest } = props

  // Check if this is a BITS Pilani logo based on alt text
  const isBITSLogo = alt?.toLowerCase().includes('bits pilani')

  return didError ? (
    <div
      className={`inline-block text-center align-middle ${className ?? ''}`}
      style={style}
    >
      {isBITSLogo ? (
        // Custom BITS Pilani branded fallback
        <div className="w-full max-w-sm mx-auto text-center py-8 px-6 bg-gradient-to-br from-[#191f5e] via-[#2563eb] to-[#1e40af] rounded-xl shadow-2xl border border-gray-200">
          <div className="text-white space-y-4">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <div className="text-[#191f5e] font-bold text-xl">B</div>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-wide mb-2" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>BITS PILANI</div>
              <div className="text-sm opacity-90 mb-3 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>Work Integrated Learning Programmes</div>
              <div className="text-xs opacity-75 border-t border-white/20 pt-3 mt-3" style={{fontFamily: 'Inter, sans-serif'}}>
                Birla Institute of Technology & Science
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Generic fallback for other images
        <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded">
          <div className="text-gray-500 text-sm">Image unavailable</div>
        </div>
      )}
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
