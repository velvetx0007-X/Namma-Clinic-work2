import React from 'react';
import LandingPageLayout from '../../components/landing/LandingPageLayout';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

const BlogPage = () => {
  const posts = [
    { title: "The Role of AI in Modern Clinic Management", excerpt: "How artificial intelligence is reducing burnout among healthcare providers.", date: "May 10, 2026", author: "Dr. Sarah Wilson", category: "AI Technology", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80" },
    { title: "Standardizing Patient Records in India", excerpt: "A deep dive into the DISHA act and how NAMMA CLINIC ensures compliance.", date: "May 05, 2026", author: "Rajesh Kumar", category: "Compliance", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" },
    { title: "5 Tips for Reducing Patient No-Show Rates", excerpt: "Using automated reminders and deposits to keep your schedule full.", date: "April 28, 2026", author: "Priya Singh", category: "Workflow", img: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80" },
    { title: "Multimodal AI in Laboratory Analysis", excerpt: "Leveraging vision models to process lab reports instantly.", date: "April 20, 2026", author: "Tech Team", category: "Engineering", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80" },
  ];

  return (
    <LandingPageLayout 
      title="Healthcare Blog" 
      description="Insights, updates, and articles about the future of digital healthcare technology."
    >
      <section className="nc-hero" style={{ minHeight: '40vh', padding: '100px 0 40px', background: '#eff6ff' }}>
        <div className="nc-hero-inner">
          <div className="nc-hero-content reveal visible">
            <div className="section-tag blue">Clinical Insights</div>
            <h1 className="hero-headline">Healthcare <span className="gradient-text">Blog</span></h1>
            <p className="hero-subtitle">Expert perspectives on medicine, technology, and clinic efficiency.</p>
          </div>
        </div>
      </section>

      <section className="nc-features" style={{ background: '#fff', paddingBottom: '100px' }}>
        <div className="nc-bento-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {posts.map((post, i) => (
            <div key={i} className="nc-bento-card reveal" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '240px', position: 'relative' }}>
                <img src={post.img} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--nc-blue)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--nc-shadow-sm)' }}>
                  <Tag size={12} /> {post.category}
                </div>
              </div>
              <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--nc-text-light)', marginBottom: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {post.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {post.author}</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '800' }}>{post.title}</h3>
                <p style={{ marginBottom: '24px', color: 'var(--nc-text-muted)', lineHeight: '1.6' }}>{post.excerpt}</p>
                <button style={{ background: 'none', border: 'none', color: 'var(--nc-blue)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  Read Article <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </LandingPageLayout>
  );
};

export default BlogPage;
