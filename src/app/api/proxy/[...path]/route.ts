import { NextRequest, NextResponse } from 'next/server';

/**
 * Generic proxy route for forwarding requests to the backend
 * Handles GET, POST, PUT, DELETE, PATCH methods
 * Usage: /api/proxy/[endpoint] → proxies to BACKEND_URL/[endpoint]
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const path = (await params).path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const targetUrl = `${backendUrl}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Proxy error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const path = (await params).path.join('/');
    const contentType = request.headers.get('content-type');
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const targetUrl = `${backendUrl}/${path}`;

    let body: FormData | string;
    const fetchHeaders: Record<string, string> = {};

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData
      body = await request.formData();
      // Don't set Content-Type; fetch will set it with boundary
    } else {
      // Handle JSON
      body = JSON.stringify(await request.json());
      fetchHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: fetchHeaders,
      body,
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Proxy error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const path = (await params).path.join('/');
    const contentType = request.headers.get('content-type');
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const targetUrl = `${backendUrl}/${path}`;

    let body: FormData | string;
    const fetchHeaders: Record<string, string> = {};

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData
      body = await request.formData();
      // Don't set Content-Type; fetch will set it with boundary
    } else {
      // Handle JSON
      body = JSON.stringify(await request.json());
      fetchHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: fetchHeaders,
      body,
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Proxy error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const path = (await params).path.join('/');
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const targetUrl = `${backendUrl}/${path}`;

    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Proxy error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const path = (await params).path.join('/');
    const contentType = request.headers.get('content-type');
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const targetUrl = `${backendUrl}/${path}`;

    let body: FormData | string;
    const fetchHeaders: Record<string, string> = {};

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData
      body = await request.formData();
      // Don't set Content-Type; fetch will set it with boundary
    } else {
      // Handle JSON
      body = JSON.stringify(await request.json());
      fetchHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(targetUrl, {
      method: 'PATCH',
      headers: fetchHeaders,
      body,
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] PATCH error:', error);
    return NextResponse.json(
      { success: false, message: 'Proxy error' },
      { status: 500 }
    );
  }
}
