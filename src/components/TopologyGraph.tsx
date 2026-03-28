import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { useSystemStore, Service } from '../store/useSystemStore'

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string
  name: string
  status: Service['status']
  latency: number
  errorRate: number
  cpu: number
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: NodeDatum | string
  target: NodeDatum | string
}

const STATUS_COLOR: Record<Service['status'], string> = {
  healthy: 'hsl(150 70% 45%)',
  failing: 'hsl(0 85% 55%)',
  recovering: 'hsl(40 90% 55%)',
}

const STATUS_GLOW: Record<Service['status'], string> = {
  healthy: 'hsl(150 70% 45% / 0.4)',
  failing: 'hsl(0 85% 55% / 0.7)',
  recovering: 'hsl(40 90% 55% / 0.4)',
}

export default function TopologyGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(null)
  const services = useSystemStore(s => s.services)

  const buildGraph = useCallback(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const { width, height } = svgRef.current.getBoundingClientRect()
    if (!width || !height) return

    svg.selectAll('*').remove()

    const nodes: NodeDatum[] = services.map(s => ({
      id: s.id,
      name: s.name,
      status: s.status,
      latency: s.latency,
      errorRate: s.errorRate,
      cpu: s.cpu,
    }))

    const links: LinkDatum[] = services.flatMap(s =>
      s.connections.map(targetId => ({
        source: s.id,
        target: targetId,
      }))
    )

    // Defs for filters & Crewmate symbol
    const defs = svg.append('defs')

    // Add Crewmate SVG Symbol
    const crewmateSymbol = defs.append('g').attr('id', 'crewmate-symbol')
    // Body
    crewmateSymbol.append('rect').attr('x', -10).attr('y', -14).attr('width', 20).attr('height', 24).attr('rx', 10).attr('class', 'crew-body').attr('fill', 'currentcolor').attr('stroke', '#000')
    // Backpack
    crewmateSymbol.append('rect').attr('x', 6).attr('y', -10).attr('width', 8).attr('height', 12).attr('rx', 3).attr('class', 'crew-body').attr('fill', 'currentcolor').attr('stroke', '#000')
    // Visor
    crewmateSymbol.append('ellipse').attr('cx', -2).attr('cy', -10).attr('rx', 7).attr('ry', 5).attr('fill', '#5ad4ff').attr('stroke', '#000')
    // Visor Reflection
    crewmateSymbol.append('ellipse').attr('cx', -5).attr('cy', -12).attr('rx', 2.5).attr('ry', 1.5).attr('fill', 'white').attr('opacity', 0.6)
    // Legs
    crewmateSymbol.append('rect').attr('x', -7).attr('y', 6).attr('width', 6).attr('height', 8).attr('rx', 3).attr('class', 'crew-body').attr('fill', 'currentcolor').attr('stroke', '#000')
    crewmateSymbol.append('rect').attr('x', 1).attr('y', 6).attr('width', 6).attr('height', 8).attr('rx', 3).attr('class', 'crew-body').attr('fill', 'currentcolor').attr('stroke', '#000')


    services.forEach(s => {
      const filter = defs.append('filter').attr('id', `glow-${s.id}`)
      filter.append('feGaussianBlur').attr('stdDeviation', s.status === 'failing' ? '4' : '6').attr('result', 'coloredBlur')
      const merge = filter.append('feMerge')
      merge.append('feMergeNode').attr('in', 'coloredBlur')
      merge.append('feMergeNode').attr('in', 'SourceGraphic')
    })

    // Links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'hsl(0 0% 25%)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')

    // Node groups
    const nodeGroup = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, NodeDatum>()
          .on('start', (event, d) => {
            if (!event.active) simulationRef.current?.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulationRef.current?.alphaTarget(0)
            d.fx = null
            d.fy = null
          }) as any
      )

    // Pulse ring for failing nodes
    nodeGroup.filter(d => d.status === 'failing')
      .append('circle')
      .attr('r', 18)
      .attr('fill', 'none')
      .attr('stroke', 'hsl(0 85% 55%)')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6)
      .append('animate')
      .attr('attributeName', 'r')
      .attr('values', `18;35;18`)
      .attr('dur', '1.2s')
      .attr('repeatCount', 'indefinite')

    nodeGroup.filter(d => d.status === 'failing')
      .select('circle')
      .append('animate')
      .attr('attributeName', 'opacity')
      .attr('values', '0.6;0;0.6')
      .attr('dur', '1.2s')
      .attr('repeatCount', 'indefinite')

    // Node Crewmate SVG
    nodeGroup.append('use')
      .attr('href', '#crewmate-symbol')
      .attr('color', d => STATUS_COLOR[d.status])
      .attr('transform', d => d.id === 'api-gateway' || d.id === 'control-room' ? 'scale(1.4)' : d.id.startsWith('db') || d.id === 'reactor' ? 'scale(1.2)' : 'scale(1)')
      .attr('filter', d => `url(#glow-${d.id})`)

    // Node labels
    nodeGroup.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.id === 'control-room' ? 26 : d.id === 'reactor' ? 22 : 18) + 12)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', 'hsl(0 0% 70%)')
      .attr('font-family', 'Inter, sans-serif')

    // Tooltip
    const tooltip = d3.select('body').select('#topology-tooltip')
      .style('position', 'fixed')
      .style('display', 'none')
      .style('background', 'hsl(0 0% 6%)')
      .style('border', '1px solid hsl(0 0% 18%)')
      .style('border-radius', '8px')
      .style('padding', '10px 14px')
      .style('font-size', '11px')
      .style('pointer-events', 'none')
      .style('z-index', '9999')
      .style('color', 'white')
      .style('font-family', 'Inter, sans-serif')
      .style('min-width', '140px')

    nodeGroup
      .on('mouseover', (event, d) => {
        tooltip
          .style('display', 'block')
          .html(`
            <div style="font-weight:600;margin-bottom:6px;font-size:12px">${d.name}</div>
            <div style="color:${STATUS_COLOR[d.status]};font-size:10px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">${d.status}</div>
            <div style="color:hsl(0 0% 55%);line-height:1.8">
              <span>Latency</span><span style="float:right;color:white">${d.latency}ms</span><br/>
              <span>Error rate</span><span style="float:right;color:white">${d.errorRate.toFixed(1)}%</span><br/>
              <span>CPU</span><span style="float:right;color:white">${d.cpu}%</span>
            </div>
          `)
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', (event.clientX + 14) + 'px')
          .style('top', (event.clientY - 10) + 'px')
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none')
      })

    const simulation = d3.forceSimulation<NodeDatum>(nodes)
      .force('link', d3.forceLink<NodeDatum, LinkDatum>(links).id(d => d.id).distance(100).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(35).strength(0.8))
      // Increase friction (alphaDecay and velocityDecay) to stop bouncy jitter
      .velocityDecay(0.6)

    simulationRef.current = simulation

    simulation.on('tick', () => {
      // Small alpha to let it settle smoothly and not jump
      link
        .attr('x1', d => (d.source as NodeDatum).x ?? 0)
        .attr('y1', d => (d.source as NodeDatum).y ?? 0)
        .attr('x2', d => (d.target as NodeDatum).x ?? 0)
        .attr('y2', d => (d.target as NodeDatum).y ?? 0)

      nodeGroup.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      simulation.stop()
    }
  }, [services])

  useEffect(() => {
    const cleanup = buildGraph()
    return cleanup
  }, [buildGraph])

  useEffect(() => {
    // Update node colors without full rebuild
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll<SVGCircleElement, NodeDatum>('circle')
      .filter((d) => d && d.id !== undefined)
      .each(function(d) {
        if (!d || !d.status) return
        const service = services.find(s => s.id === d.id)
        if (service) {
          d.status = service.status
        }
      })
  }, [services])

  return (
    <div className="relative w-full h-full">
      <div id="topology-tooltip" />
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}
